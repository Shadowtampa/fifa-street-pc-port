using System.Text.Json;
using System.Text.Json.Nodes;
using System.Runtime.InteropServices;
using Microsoft.Win32;

namespace FifaStreetLauncher;

// Performance report: the runtime writes Logs\perf-report.json (FPS per scene) while the game runs; after each session
// the launcher adds the PC and the settings, shows it on the page and, if the player agreed once, sends it to the
// server anonymously (a random id per install, no name, no key).
public partial class LauncherForm
{
    private static readonly string PerfPrefsPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ReStreet", "perf.json");
    private static readonly string PerfHistoryPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ReStreet", "perf-history.json");
    private static readonly HttpClient PerfHttp = new() { Timeout = TimeSpan.FromSeconds(8) };
    private string? lastPerfJson;
    private bool perfShareCached = LoadPerfPrefs().Share == true;  // shown on the page every second, read once

    private sealed class PerfPrefs
    {
        public bool? Share { get; set; }  // null = not asked yet
        public string InstallId { get; set; } = Guid.NewGuid().ToString("N");
    }

    private static PerfPrefs LoadPerfPrefs()
    {
        try
        {
            if (File.Exists(PerfPrefsPath))
                return JsonSerializer.Deserialize<PerfPrefs>(File.ReadAllText(PerfPrefsPath)) ?? new PerfPrefs();
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or JsonException) { }
        return new PerfPrefs();
    }

    private static void SavePerfPrefs(PerfPrefs prefs)
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(PerfPrefsPath)!);
            File.WriteAllText(PerfPrefsPath, JsonSerializer.Serialize(prefs));
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { }
    }

    // Called by the page: {cmd:"perfShare", value:true|false}.
    private void SetPerfSharing(bool share)
    {
        var prefs = LoadPerfPrefs();
        prefs.Share = share;
        perfShareCached = share;
        SavePerfPrefs(prefs);
        if (share && lastPerfJson != null) _ = SendPerfAsync(lastPerfJson);
    }

    // After the game exits: build the full report from the runtime file plus this PC and the launch settings.
    private void OnSessionEnded(string reportPath, string logFile, Dictionary<string, object?> settings, int exitCode)
    {
        try
        {
            // No report (the game closed in the first seconds or crashed before 30 s): still count the session.
            var report = File.Exists(reportPath) ? JsonNode.Parse(File.ReadAllText(reportPath))!.AsObject()
                                                 : new JsonObject { ["version"] = 1, ["scenes"] = new JsonObject() };
            var prefs = LoadPerfPrefs();
            SavePerfPrefs(prefs);  // keeps the install id stable from the first report on
            report["install_id"] = prefs.InstallId;
            report["launcher"] = LauncherVersion;
            report["gpu_used"] = ReadGpuFromLog(logFile);
            report["pc"] = new JsonObject
            {
                ["cpu"] = Registry.GetValue(@"HKEY_LOCAL_MACHINE\HARDWARE\DESCRIPTION\System\CentralProcessor\0",
                                            "ProcessorNameString", "")?.ToString()?.Trim(),
                ["threads"] = Environment.ProcessorCount,
                ["ram_gb"] = Math.Round(GC.GetGCMemoryInfo().TotalAvailableMemoryBytes / 1073741824.0),
                ["windows"] = Environment.OSVersion.Version.ToString(),
            };
            report["settings"] = JsonSerializer.SerializeToNode(settings);
            report["exit_code"] = exitCode;
            report["time"] = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            report["integrated_gpu"] = IsIntegratedGpu(report["gpu_used"]?.ToString());
            lastPerfJson = report.ToJsonString();
            File.WriteAllText(reportPath, report.ToJsonString(new JsonSerializerOptions { WriteIndented = true }));

            AppendPerfHistory(report);
            PostToPage(new { type = "perf", report = JsonNode.Parse(lastPerfJson), ask = prefs.Share == null, share = prefs.Share == true });
            PushPerfHistory();
            if (prefs.Share == true) _ = SendPerfAsync(lastPerfJson);
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or JsonException or InvalidOperationException) { }
    }

    // Last 30 sessions on this PC, newest first, for the Performance page.
    private static JsonArray LoadPerfHistory()
    {
        try { if (File.Exists(PerfHistoryPath)) return JsonNode.Parse(File.ReadAllText(PerfHistoryPath)) as JsonArray ?? new JsonArray(); }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or JsonException) { }
        return new JsonArray();
    }

    private static void AppendPerfHistory(JsonObject report)
    {
        var history = LoadPerfHistory();
        history.Insert(0, report.DeepClone());
        while (history.Count > 30) history.RemoveAt(history.Count - 1);
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(PerfHistoryPath)!);
            File.WriteAllText(PerfHistoryPath, history.ToJsonString());
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { }
    }

    private void PushPerfHistory()
    {
        var adapters = new List<object>();
        try { adapters.AddRange(DxgiAdapters.Enumerate().Select(a => new { name = a.Name, vram_mb = (long)(a.DedicatedMemory / 1048576) })); }
        catch (Exception ex) when (ex is COMException or DllNotFoundException) { }
        PostToPage(new { type = "perfHistory", history = LoadPerfHistory(), adapters, share = perfShareCached });
    }

    // A GPU with little dedicated memory while this PC also has one with 1 GB or more: the game ran on the slow one.
    private static bool IsIntegratedGpu(string? gpu)
    {
        if (string.IsNullOrEmpty(gpu)) return false;
        // APU-only PCs have no dedicated card to compare against, and AMD APUs report 512 MB+ of carve-out, so match names first.
        if (System.Text.RegularExpressions.Regex.IsMatch(gpu,
                @"^Intel(?!.*Arc(\(TM\))? [AB]\d).*(HD|UHD|Iris|Graphics)|Radeon(\(TM\))? Graphics$|Vega \d+ Graphics|Radeon(\(TM\))? \d{3}M\b",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase))
            return true;
        try
        {
            var list = DxgiAdapters.Enumerate();
            var used = list.FirstOrDefault(a => a.Name.Trim().Equals(gpu.Trim(), StringComparison.OrdinalIgnoreCase));
            return used != null && used.DedicatedMemory < 512UL << 20 && list.Any(a => a.DedicatedMemory >= 1UL << 30);
        }
        catch (Exception ex) when (ex is COMException or DllNotFoundException) { return false; }
    }

    // The adapter the runtime really used (it can differ from the launcher's choice on automatic selection).
    // The log keeps earlier sessions (it rotates at 5 MB), so the last adapter line is this session's.
    private static string? ReadGpuFromLog(string logFile)
    {
        string? gpu = null;
        try
        {
            using var stream = new FileStream(logFile, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var reader = new StreamReader(stream);
            while (reader.ReadLine() is { } line)
            {
                int d = line.IndexOf("DXGI adapter: ", StringComparison.Ordinal);
                if (d >= 0) gpu = line[(d + 14)..].Split(" (vendor")[0];
                int v = line.IndexOf("Vulkan device '", StringComparison.Ordinal);
                if (v >= 0) gpu = line[(v + 15)..].Split('\'')[0];
            }
        }
        catch (IOException) { }
        return gpu;
    }

    private async Task SendPerfAsync(string json)
    {
        string server = LoadOnlineConfig()?.Server ?? Regions[0].Address;
        try
        {
            using var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            using var _ = await PerfHttp.PostAsync($"http://{server}:29812/v1/perf", content);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException) { /* best effort */ }
    }
}
