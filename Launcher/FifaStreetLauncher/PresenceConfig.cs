using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;

namespace FifaStreetLauncher;

/// <summary>
/// Everything the Discord card needs that is not a launcher setting. It lives in
/// <c>presence.json</c> next to the launcher so the Discord application id, the
/// art asset keys and the wording can be changed without a rebuild, and so a
/// player who does not want the card can switch it off in one place.
///
/// When the file is missing, presence is off. Nothing is written automatically:
/// no file, no Discord application, no card.
/// </summary>
public sealed class PresenceConfig
{
    /// <summary>Master switch.</summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// The Discord application id. The application's NAME is what Discord prints
    /// after "Playing", so the application should be called "ReStreet PC".
    /// </summary>
    public string? ApplicationId { get; set; }

    /// <summary>First line of the card. Empty leaves the line off.</summary>
    public string Details { get; set; } = "FIFA Street 2012 Recompiled";

    /// <summary>
    /// Second line. Empty leaves the line off entirely rather than drawing a
    /// blank one. Placeholders filled in by the launcher:
    /// {api} {width} {height} {refresh} {internal} {profile} {gpu}
    /// </summary>
    public string State { get; set; } = "";

    /// <summary>Art asset keys uploaded in the developer portal (Rich Presence, Art Assets).</summary>
    public string LargeImage { get; set; } = "cover";
    public string LargeText { get; set; } = "ReStreet - FIFA Street 2012 Recompiled";

    /// <summary>Corner badge. Empty on both means no badge at all.</summary>
    public string SmallImageD3D12 { get; set; } = "";
    public string SmallImageVulkan { get; set; } = "";

    /// <summary>Up to two buttons. Leave the list empty for none.</summary>
    public List<PresenceButton> Buttons { get; set; } = new();

    /// <summary>
    /// Optional file the game side can write to say what is happening right now
    /// (see docs/DISCORD-PRESENCE.md). Relative paths resolve against the folder
    /// holding fifastreet.exe. Missing file means the card keeps the static text.
    /// </summary>
    public string StateFile { get; set; } = "Logs\\presence.txt";

    /// <summary>
    /// Wording per language, keyed by the two-letter code of the game language
    /// chosen in the launcher: en, es, pt, fr, de, it. Anything a translation
    /// leaves out falls back to the values above, so a partial translation is
    /// fine and an unknown language is never a failure.
    /// </summary>
    public Dictionary<string, PresenceText> Translations { get; set; } = new();

    /// <summary>Mode names for the base language, keyed as in <see cref="PresenceText.Modes"/>.</summary>
    public Dictionary<string, string> Modes { get; set; } = new();

    /// <summary>The Xbox language ids the launcher uses, as two-letter codes.</summary>
    public static string LanguageCode(int gameLanguageId) => gameLanguageId switch
    {
        3 => "de",
        4 => "fr",
        5 => "es",
        6 => "it",
        9 => "pt",
        _ => "en",
    };

    /// <summary>The wording to use for one language, with every gap filled in.</summary>
    public PresenceText Resolve(string languageCode)
    {
        var text = new PresenceText
        {
            Details = Details,
            State = State,
            LargeText = LargeText,
            Modes = new Dictionary<string, string>(Modes, StringComparer.OrdinalIgnoreCase),
        };

        if (Translations is null || string.IsNullOrWhiteSpace(languageCode))
            return text;

        foreach (var pair in Translations)
        {
            if (!string.Equals(pair.Key, languageCode, StringComparison.OrdinalIgnoreCase))
                continue;

            var t = pair.Value;
            if (t is null) break;
            if (t.Details is not null) text.Details = t.Details;
            if (t.State is not null) text.State = t.State;
            if (t.LargeText is not null) text.LargeText = t.LargeText;
            if (t.Modes is not null)
            {
                foreach (var mode in t.Modes)
                    text.Modes[mode.Key] = mode.Value;
            }
            break;
        }

        return text;
    }

    public static PresenceConfig Load(string launcherDir)
    {
        try
        {
            var path = Path.Combine(launcherDir, "presence.json");
            if (!File.Exists(path)) return new PresenceConfig { Enabled = false };

            var parsed = System.Text.Json.JsonSerializer.Deserialize<PresenceConfig>(
                File.ReadAllText(path),
                new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    ReadCommentHandling = System.Text.Json.JsonCommentHandling.Skip,
                    AllowTrailingCommas = true
                });

            return parsed ?? new PresenceConfig { Enabled = false };
        }
        catch
        {
            // A broken file must not stop the game from starting.
            return new PresenceConfig { Enabled = false };
        }
    }

    public bool Usable =>
        Enabled && !string.IsNullOrWhiteSpace(ApplicationId) &&
        ulong.TryParse(ApplicationId!.Trim(), NumberStyles.None, CultureInfo.InvariantCulture, out _);
}

/// <summary>One language's wording. Null fields fall back to the base values.</summary>
public sealed class PresenceText
{
    public string? Details { get; set; }
    public string? State { get; set; }
    public string? LargeText { get; set; }

    /// <summary>
    /// Mode names, keyed by the canonical name the game side writes
    /// (main_menu, hit_the_streets, world_tour, online, practice, ...).
    /// Keeping the key in English means the game side never has to know which
    /// language the player picked.
    /// </summary>
    public Dictionary<string, string>? Modes { get; set; }
}

public sealed class PresenceButton
{
    public string Label { get; set; } = "";
    public string Url { get; set; } = "";
}

/// <summary>
/// Reads the optional state file the game side may write. Format is one
/// <c>key=value</c> per line. Recognised keys:
///
///   details=Some text        replaces the first line as written
///   state=Some text          replaces the second line as written
///   mode=world_tour          replaces the second line with the player's
///                            language version of that mode name
///
/// Unknown keys are ignored, so the game side can add more later without
/// breaking an older launcher.
/// </summary>
public sealed class PresenceStateFile
{
    private readonly string? path;
    private DateTime lastWrite = DateTime.MinValue;
    private long lastLength = -1;

    public string? Details { get; private set; }
    public string? State { get; private set; }
    public string? Mode { get; private set; }

    public PresenceStateFile(string? path)
    {
        this.path = string.IsNullOrWhiteSpace(path) ? null : path;
    }

    /// <summary>Returns true when the contents changed since the last call.</summary>
    public bool Poll()
    {
        if (path is null) return false;
        try
        {
            var info = new FileInfo(path);
            if (!info.Exists)
            {
                if (Details is null && State is null && Mode is null) return false;
                Details = State = Mode = null;
                lastWrite = DateTime.MinValue;
                lastLength = -1;
                return true;
            }

            if (info.LastWriteTimeUtc == lastWrite && info.Length == lastLength) return false;
            lastWrite = info.LastWriteTimeUtc;
            lastLength = info.Length;

            string? details = null, state = null, mode = null;
            using var stream = new FileStream(
                path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
            using var text = new StreamReader(stream);
            for (var line = text.ReadLine(); line is not null; line = text.ReadLine())
            {
                int split = line.IndexOf('=');
                if (split <= 0) continue;
                var key = line.Substring(0, split).Trim().ToLowerInvariant();
                var value = line.Substring(split + 1).Trim();
                if (value.Length == 0) continue;
                if (key == "details") details = value;
                else if (key == "state") state = value;
                else if (key == "mode") mode = value;
            }

            if (details == Details && state == State && mode == Mode) return false;
            Details = details;
            State = state;
            Mode = mode;
            return true;
        }
        catch
        {
            return false;
        }
    }
}
