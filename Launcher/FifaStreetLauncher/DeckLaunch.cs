using System.Diagnostics;
using System.Globalization;
using System.Text;

namespace FifaStreetLauncher;

// ReStreet 2.0 (the deck base): the graphics options live in the game's fifastreet.toml, the same file the in-game
// menu (F5 / L3+R3) writes, so the launcher and the menu always show the same values. The launcher reads the file
// when it opens and writes it before starting the game; it passes no REX_* graphics variables (they would beat the
// file). The game always runs at 1280x720 inside (the runtime ignores the window size for that); the window size, the
// internal resolution and the scaling only change how the image is drawn and shown.
public partial class LauncherForm
{
    private readonly ComboBox scalingBox = new() { DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly ComboBox aspectBox = new() { DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly ComboBox fpsLimitBox = new() { DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly ComboBox anisoBox = new() { DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly ComboBox occlusionBox = new() { DropDownStyle = ComboBoxStyle.DropDownList };

    // (label, present_effect, modo_fsr)
    private static readonly (string Label, string Effect, string Mode)[] DeckScaling =
    {
        ("Bilinear", "bilinear", ""), ("FSR 1", "fsr", ""), ("FSR 1 Quality", "fsr", "calidad"),
        ("FSR 1 Balanced", "fsr", "equilibrado"), ("FSR 1 Performance", "fsr", "rendimiento"),
        ("FSR 1 Ultra Performance", "fsr", "ultra_rendimiento"),
    };
    private static readonly (string Label, double Hz)[] DeckFpsLimits =
    {
        ("Screen refresh rate", -1), ("No limit", 0), ("30", 30), ("60", 60), ("90", 90), ("120", 120), ("144", 144),
        ("165", 165), ("240", 240),
    };
    private static readonly (string Label, int Value)[] DeckAniso =
    {
        ("Game default", -1), ("Off", 0), ("1x", 1), ("2x", 2), ("4x", 3), ("8x", 4), ("16x", 5),
    };
    private static readonly (string Label, string Value)[] DeckOcclusion = { ("Off", ""), ("SSAO", "ssao"), ("HBAO", "hbao"), ("GTAO", "gtao") };

    private bool deckBase;

    private static bool IsDeckBase(string exeDirectory) => File.Exists(Path.Combine(exeDirectory, "ajustes-del-port.txt"));

    private string ExeDirectory()
    {
        try { return Path.GetDirectoryName(Path.GetFullPath(exePathBox.Text.Trim())) ?? AppContext.BaseDirectory; }
        catch (Exception ex) when (ex is ArgumentException or NotSupportedException or PathTooLongException) { return AppContext.BaseDirectory; }
    }

    // Called after LoadSettings: fills the deck lists and takes the current values from fifastreet.toml.
    private void InitDeckOptions()
    {
        deckBase = IsDeckBase(ExeDirectory());
        if (!deckBase) return;
        scalingBox.Items.AddRange(DeckScaling.Select(s => (object)s.Label).ToArray());
        aspectBox.Items.AddRange(new object[] { "Match screen", "16:9 (console)" });
        fpsLimitBox.Items.AddRange(DeckFpsLimits.Select(s => (object)s.Label).ToArray());
        anisoBox.Items.AddRange(DeckAniso.Select(s => (object)s.Label).ToArray());
        occlusionBox.Items.AddRange(DeckOcclusion.Select(s => (object)s.Label).ToArray());
        scalingBox.SelectedIndex = 1; aspectBox.SelectedIndex = 0; fpsLimitBox.SelectedIndex = 0; anisoBox.SelectedIndex = 6; occlusionBox.SelectedIndex = 0;

        var toml = ReadToml(TomlPath());
        string Str(string key) => toml.TryGetValue(key, out var v) ? v.Trim('"') : "";
        bool? Bool(string key) => toml.TryGetValue(key, out var v) ? v == "true" : null;
        double? Num(string key) => toml.TryGetValue(key, out var v) && double.TryParse(v.Trim('"'), NumberStyles.Float, CultureInfo.InvariantCulture, out double d) ? d : null;

        string effect = Str("present_effect"), mode = Str("modo_fsr");
        int scale = Array.FindIndex(DeckScaling, s => s.Effect == effect && (effect != "fsr" || s.Mode == mode));
        if (scale >= 0) scalingBox.SelectedIndex = scale;
        if (Bool("proporcion_de_la_pantalla") is { } aspect) aspectBox.SelectedIndex = aspect ? 0 : 1;
        if (Num("ritmo_contra_pantalla_hz") is { } hz) { int i = Array.FindIndex(DeckFpsLimits, f => Math.Abs(f.Hz - hz) < 0.5); if (i >= 0) fpsLimitBox.SelectedIndex = i; }
        if (Num("anisotropic_override") is { } an) { int i = Array.FindIndex(DeckAniso, a => a.Value == (int)an); if (i >= 0) anisoBox.SelectedIndex = i; }
        string ao = Str("modo_oclusion"); { int i = Array.FindIndex(DeckOcclusion, o => o.Value == ao); if (i >= 0) occlusionBox.SelectedIndex = i; }
        if (Bool("sincronia_vertical") is { } vs) vsyncBox.Checked = vs;
        if (Bool("multimuestreo_del_juego") is { } ms) msaaBox.Checked = ms;
        if (Bool("fullscreen") is { } fs) displayModeBox.SelectedIndex = fs ? 0 : 1;
        int post = Str("swap_post_effect") switch { "none" => 0, "fxaa" => 1, "fxaa_extreme" => 2, _ => -1 };
        if (post >= 0) postEffectBox.SelectedIndex = post;
        string res = Str("resolucion_interna");
        if (int.TryParse(res, out int ri) && ri >= 1 && ri <= internalResolutionBox.Items.Count) internalResolutionBox.SelectedIndex = ri - 1;
        if (Num("window_width") is { } ww && Num("window_height") is { } wh)
        {
            int i = resolutionBox.Items.IndexOf($"{(int)ww}x{(int)wh}");
            if (i >= 0) resolutionBox.SelectedIndex = i;
        }
    }

    private string TomlPath() => Path.Combine(ExeDirectory(), "fifastreet.toml");

    private void ApplyDeckLaunch(ProcessStartInfo startInfo, string exeDirectory, string graphicsApi, int adapter)
    {
        UseCpuBuild(exeDirectory, graphicsApi);
        // The deck port's own start-up switches (native renderer, its shader folders...), as its launcher sets them.
        foreach (string line in File.ReadAllLines(Path.Combine(exeDirectory, "ajustes-del-port.txt")))
        {
            int eq = line.IndexOf('=');
            if (eq <= 0 || line.StartsWith('?') || line.StartsWith('#')) continue;
            startInfo.Environment[line[..eq].Trim()] = line[(eq + 1)..].Trim();
        }
        startInfo.Environment["REX_GPU_BACKEND"] = graphicsApi == "Vulkan" ? "vulkan" : "d3d12";
        if (graphicsApi == "Vulkan") startInfo.Environment["REX_VULKAN_DEVICE"] = "-1";
        else if (adapter >= 0) startInfo.Environment["REX_D3D12_ADAPTER"] = adapter.ToString(CultureInfo.InvariantCulture);

        SaveDeckToml();
    }

    // The deck build is compiled for x86-64-v3 (AVX2/BMI2/FMA): on older CPUs (Ivy Bridge, AMD FX...) its DLLs fail to
    // load with 0xc0000142. Binaries\AVX2 and Binaries\NoAVX2 hold the game built with and without it; before every
    // start the set for this CPU goes over Binaries\ (only files that differ, so a copy is paid once). The AVX2 runtime
    // is Backends\<api>\rexruntime.dll, already copied by the caller; NoAVX2 has its own Backends.
    private static readonly bool CpuHasX86_64V3 =
        System.Runtime.Intrinsics.X86.Avx2.IsSupported && System.Runtime.Intrinsics.X86.Bmi2.IsSupported &&
        System.Runtime.Intrinsics.X86.Fma.IsSupported && System.Runtime.Intrinsics.X86.Lzcnt.IsSupported;

    private static void UseCpuBuild(string exeDirectory, string graphicsApi)
    {
        string set = Path.Combine(exeDirectory, CpuHasX86_64V3 ? "AVX2" : "NoAVX2");
        if (!Directory.Exists(set)) return;
        foreach (string name in new[] { "fifastreet.exe", "fifastreet_fifadllzf_xex.dll", "fifastreet_footballcompengzf_xex.dll" })
            CopyIfDifferent(Path.Combine(set, name), Path.Combine(exeDirectory, name));
        // rexruntime.dll AND rexgpu-xenos.dll: the GPU plugin is x86-64-v3 code too.
        string backend = Path.Combine(set, "Backends", graphicsApi);
        if (!CpuHasX86_64V3 && Directory.Exists(backend))
            foreach (string dll in Directory.GetFiles(backend, "*.dll"))
                CopyIfDifferent(dll, Path.Combine(exeDirectory, Path.GetFileName(dll)));
    }

    private static void CopyIfDifferent(string source, string target)
    {
        if (!File.Exists(source)) return;
        var s = new FileInfo(source);
        var t = new FileInfo(target);
        if (t.Exists && t.Length == s.Length && t.LastWriteTimeUtc == s.LastWriteTimeUtc) return;
        File.Copy(source, target, true);  // File.Copy keeps the write time, so the next start skips it
    }

    // The launcher's current choices into fifastreet.toml (on every change, and before each start).
    private void SaveDeckToml()
    {
        if (!deckBase) return;
        var size = resolutionBox.Text.Split('x');
        var scaling = DeckScaling[Math.Max(0, scalingBox.SelectedIndex)];
        var values = new Dictionary<string, string>
        {
            ["fullscreen"] = displayModeBox.SelectedIndex == 0 ? "true" : "false",
            ["gpu_backend"] = graphicsApiBox.SelectedIndex == 1 ? "\"vulkan\"" : "\"d3d12\"",
            ["resolucion_interna"] = "\"" + Math.Max(1, internalResolutionBox.SelectedIndex + 1).ToString(CultureInfo.InvariantCulture) + "\"",
            ["present_effect"] = "\"" + scaling.Effect + "\"",
            ["modo_fsr"] = "\"" + scaling.Mode + "\"",
            ["proporcion_de_la_pantalla"] = aspectBox.SelectedIndex == 1 ? "false" : "true",
            ["ritmo_contra_pantalla_hz"] = DeckFpsLimits[Math.Max(0, fpsLimitBox.SelectedIndex)].Hz.ToString("0.000000", CultureInfo.InvariantCulture),
            ["sincronia_vertical"] = vsyncBox.Checked ? "true" : "false",
            ["anisotropic_override"] = DeckAniso[Math.Max(0, anisoBox.SelectedIndex)].Value.ToString(CultureInfo.InvariantCulture),
            ["swap_post_effect"] = "\"" + (postEffectBox.SelectedIndex switch { 1 => "fxaa", 2 => "fxaa_extreme", _ => "none" }) + "\"",
            ["multimuestreo_del_juego"] = msaaBox.Checked ? "true" : "false",
            ["modo_oclusion"] = "\"" + DeckOcclusion[Math.Max(0, occlusionBox.SelectedIndex)].Value + "\"",
        };
        if (size.Length == 2 && int.TryParse(size[0], out int w) && int.TryParse(size[1], out int h) && w > 0 && h > 0)
        {
            // A window larger than its monitor shows only part of the game: in a window, take the largest usual 16:9 size
            // that fits the work area with its title bar.
            var screens = Screen.AllScreens;
            var area = screens[Math.Clamp(monitorBox.SelectedIndex, 0, screens.Length - 1)].WorkingArea;
            if (displayModeBox.SelectedIndex != 0 && (w > area.Width - 16 || h > area.Height - 48))
            {
                (w, h) = new[] { (3840, 2160), (2560, 1440), (1920, 1080), (1600, 900), (1280, 720) }
                    .FirstOrDefault(s => s.Item1 <= area.Width - 16 && s.Item2 <= area.Height - 48, (1280, 720));
                int shown = resolutionBox.Items.IndexOf($"{w}x{h}");  // the launcher shows the size the game gets
                if (shown >= 0) resolutionBox.SelectedIndex = shown;
            }
            values["window_width"] = w.ToString(CultureInfo.InvariantCulture);
            values["window_height"] = h.ToString(CultureInfo.InvariantCulture);
        }
        try { WriteToml(TomlPath(), values); }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { Debug.WriteLine(ex.Message); }
    }

    // fifastreet.toml as the runtime writes it: "key = value" lines, plus comments and [sections] that are kept as they are.
    private static Dictionary<string, string> ReadToml(string path)
    {
        var map = new Dictionary<string, string>(StringComparer.Ordinal);
        try
        {
            if (!File.Exists(path)) return map;
            foreach (string line in File.ReadAllLines(path))
            {
                int eq = line.IndexOf('=');
                if (eq <= 0 || line.TrimStart().StartsWith('#') || line.TrimStart().StartsWith('[')) continue;
                map[line[..eq].Trim()] = line[(eq + 1)..].Trim();
            }
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { Debug.WriteLine(ex.Message); }
        return map;
    }

    private static void WriteToml(string path, IReadOnlyDictionary<string, string> values)
    {
        var lines = File.Exists(path) ? File.ReadAllLines(path).ToList() : new List<string> { "# Auto-generated cvar configuration" };
        var left = new HashSet<string>(values.Keys);
        for (int i = 0; i < lines.Count; i++)
        {
            int eq = lines[i].IndexOf('=');
            if (eq <= 0 || lines[i].TrimStart().StartsWith('#')) continue;
            string key = lines[i][..eq].Trim();
            if (!values.TryGetValue(key, out var v)) continue;
            lines[i] = key + " = " + v;
            left.Remove(key);
        }
        // New keys go before the first [section], where the runtime keeps the plain ones.
        int at = lines.FindIndex(l => l.TrimStart().StartsWith('['));
        if (at < 0) at = lines.Count;
        lines.InsertRange(at, left.Select(k => k + " = " + values[k]));
        File.WriteAllLines(path, lines, new UTF8Encoding(false));
    }
}
