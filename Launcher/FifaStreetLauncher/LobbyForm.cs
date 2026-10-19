using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;
using ReStreet.Ui;

namespace FifaStreetLauncher;

internal enum LobbyState { Header, Searching, InMatch, Online }

// One line of the lobby: a section header or a player with a status symbol.
internal sealed record LobbyRow(LobbyState State, string Name, string Detail = "", bool IsMe = false);

// The lobby list is drawn by hand so it matches the rest of the launcher.
// Symbols (shape + colour, so they also read without colour): green dot = online in the menus,
// pulsing yellow ring = searching for a match, blue play triangle = in a match.
internal sealed class LobbyList : Control
{
    const int RowH = 44, HeaderH = 32;
    static readonly Color Green = Color.FromArgb(86, 214, 120);
    static readonly Color Blue = Color.FromArgb(90, 170, 255);
    readonly List<LobbyRow> rows = new();
    int scroll;
    bool pulse;
    readonly System.Windows.Forms.Timer pulseTimer = new() { Interval = 550 };

    public string EmptyText { get; set; } = "";

    public LobbyList()
    {
        SetStyle(ControlStyles.UserPaint | ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.ResizeRedraw, true);
        BackColor = StreetTheme.Field;
        pulseTimer.Tick += (_, _) => { pulse = !pulse; if (rows.Any(r => r.State == LobbyState.Searching)) Invalidate(); };
        pulseTimer.Start();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing) pulseTimer.Dispose();
        base.Dispose(disposing);
    }

    public void SetRows(IEnumerable<LobbyRow> items)
    {
        rows.Clear();
        rows.AddRange(items);
        ClampScroll();
        Invalidate();
    }

    float K => StreetTheme.K(this);
    int RowHeight(LobbyRow row) => (int)((row.State == LobbyState.Header ? HeaderH : RowH) * K);
    int TotalHeight() { int sum = 0; foreach (var row in rows) sum += RowHeight(row); return sum; }
    void ClampScroll() => scroll = Math.Max(0, Math.Min(scroll, Math.Max(0, TotalHeight() - Height)));

    protected override void OnMouseWheel(MouseEventArgs e)
    {
        scroll -= Math.Sign(e.Delta) * (int)(RowH * K);
        ClampScroll();
        Invalidate();
    }

    protected override void OnPaintBackground(PaintEventArgs e) { }

    static void DrawSymbol(Graphics g, LobbyState state, RectangleF box, bool pulseOn)
    {
        switch (state)
        {
            case LobbyState.Online:
                using (var brush = new SolidBrush(Green)) g.FillEllipse(brush, box);
                break;
            case LobbyState.Searching:
            {
                float width = (pulseOn ? 3.2f : 2.2f) * box.Width / 12f;
                var ring = RectangleF.Inflate(box, -width / 2, -width / 2);
                using var pen = new Pen(StreetTheme.Yellow, width);
                g.DrawEllipse(pen, ring);
                float core = box.Width * (pulseOn ? 0.22f : 0.34f);
                using var dot = new SolidBrush(StreetTheme.Yellow);
                g.FillEllipse(dot, box.X + (box.Width - core) / 2, box.Y + (box.Height - core) / 2, core, core);
                break;
            }
            case LobbyState.InMatch:
            {
                var triangle = new[]
                {
                    new PointF(box.X + box.Width * 0.18f, box.Y),
                    new PointF(box.Right, box.Y + box.Height / 2),
                    new PointF(box.X + box.Width * 0.18f, box.Bottom)
                };
                using var brush = new SolidBrush(Blue);
                g.FillPolygon(brush, triangle);
                break;
            }
        }
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics;
        StreetTheme.PaintBehind(this, g);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        float k = K;
        var frame = new RectangleF(0.5f, 0.5f, Width - 1, Height - 1);
        using var path = StreetTheme.Round(frame, 8 * k);
        using (var fill = new SolidBrush(StreetTheme.Field)) g.FillPath(fill, path);
        var saved = g.Save();
        g.SetClip(path, CombineMode.Intersect);

        using var nameFont = new Font("Segoe UI", 14f * k, GraphicsUnit.Pixel);
        using var nameBold = new Font("Segoe UI", 14f * k, FontStyle.Bold, GraphicsUnit.Pixel);
        using var detailFont = new Font("Segoe UI", 12.67f * k, GraphicsUnit.Pixel);
        using var headerFont = new Font(StreetTheme.CondensedFamily, 11 * k, FontStyle.Bold, GraphicsUnit.Pixel);

        if (rows.Count == 0)
            TextRenderer.DrawText(g, EmptyText, nameFont, new Rectangle((int)(16 * k), (int)(14 * k), Width - (int)(32 * k), Height), StreetTheme.Muted,
                TextFormatFlags.WordBreak | TextFormatFlags.NoPadding);

        int y = -scroll;
        foreach (var row in rows)
        {
            int h = RowHeight(row);
            var bounds = new Rectangle(0, y, Width, h);
            y += h;
            if (bounds.Bottom < 0 || bounds.Top > Height) continue;

            if (row.State == LobbyState.Header)
            {
                using var yellow = new SolidBrush(StreetTheme.Yellow);
                StreetTheme.DrawSpaced(g, row.Name, headerFont, yellow, new PointF(16 * k, bounds.Y + 12 * k), 2.2f * k);
                continue;
            }

            float symbol = 12 * k;
            DrawSymbol(g, row.State, new RectangleF(16 * k, bounds.Y + (h - symbol) / 2, symbol, symbol), pulse);

            string name = row.IsMe ? row.Name + "  (you)" : row.Name;
            int detailWidth = (int)(190 * k);
            TextRenderer.DrawText(g, name, row.IsMe ? nameBold : nameFont,
                new Rectangle((int)(38 * k), bounds.Y, Width - (int)(38 * k) - detailWidth - (int)(14 * k), h), StreetTheme.Ink,
                TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis | TextFormatFlags.NoPadding | TextFormatFlags.SingleLine);
            Color detailColor = row.State switch { LobbyState.Searching => StreetTheme.Yellow, LobbyState.InMatch => Blue, _ => StreetTheme.Muted };
            TextRenderer.DrawText(g, row.Detail, detailFont,
                new Rectangle(Width - detailWidth - (int)(14 * k), bounds.Y, detailWidth, h), detailColor,
                TextFormatFlags.VerticalCenter | TextFormatFlags.Right | TextFormatFlags.EndEllipsis | TextFormatFlags.NoPadding | TextFormatFlags.SingleLine);
        }
        g.Restore(saved);
        using var edge = new Pen(Color.FromArgb(60, 255, 255, 255));
        g.DrawPath(edge, path);
    }
}

// Who is online, who is searching for a match (and in which mode) and who is in a match.
// Same frame, fonts and colours as the friends window.
internal sealed class LobbyForm : Form, ISceneHost, IUiScaled
{
    readonly UiScaler scaler;
    public float UiScale => scaler.Scale;

    const float DesignHeight = 610f;
    new const int Left = 48;
    const int SheetX = 480, SheetY = 32, SheetW = 422, SheetH = 546, Pad = 24;
    const int ContentX = SheetX + Pad, ContentW = SheetW - 2 * Pad;

    static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(5) };

    readonly string server, me;
    readonly SlantButton closeButton = new();
    readonly LobbyList list = new();
    readonly ThemedLabel meLabel = new();
    readonly ThemedLabel connection = new();
    readonly ThemedLabel summary = new();
    readonly System.Windows.Forms.Timer poll = new() { Interval = 4000 };

    Bitmap? scene;
    Size sceneSize;
    bool busy;
    bool previewing;   // sample rows for screenshots: never overwritten by a refresh

    public Bitmap SceneBitmap { get { BuildScene(); return scene!; } }

    internal LobbyForm(string server, string me)
    {
        this.server = server;
        this.me = me;
        Text = "ReStreet - Lobby";
        using (var icon = typeof(LobbyForm).Assembly.GetManifestResourceStream("fifastreet.ico")!)
            Icon = new Icon(icon);
        ClientSize = new Size(930, 610);
        scaler = new UiScaler(this, 930, 610);
        StartPosition = FormStartPosition.CenterParent;
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox = false;
        MinimizeBox = false;
        DoubleBuffered = true;
        ResizeRedraw = true;
        BackColor = StreetTheme.Asphalt;
        ForeColor = StreetTheme.Ink;
        Font = StreetTheme.Body(10);
        HandleCreated += (_, _) => StreetTheme.ApplyDarkTitleBar(Handle);

        meLabel.SetBounds(Left, 264, 384, 28);
        meLabel.Font = StreetTheme.Body(13f, FontStyle.Bold);
        meLabel.ForeColor = StreetTheme.Ink;
        meLabel.Text = "Playing as " + me;
        Controls.Add(meLabel);
        connection.SetBounds(Left, 296, 384, 24);
        connection.Font = StreetTheme.Body(10);
        connection.ForeColor = StreetTheme.Muted;
        connection.Text = "Connecting…";
        Controls.Add(connection);
        Controls.Add(new ThemedLabel
        {
            Text = "In the game: Xbox LIVE, Street Seasons, Division Match, then pick a game mode. Search in the same mode as the person you want to play: " +
                   "the server only pairs players who search for the same mode.",
            Bounds = new Rectangle(Left, 336, 384, 96),
            Font = StreetTheme.Body(10),
            ForeColor = StreetTheme.Muted
        });
        Controls.Add(new LegendPanel { Bounds = new Rectangle(Left, 440, 384, 84) });

        Controls.Add(new ThemedLabel
        {
            Text = "Lobby", Bounds = new Rectangle(ContentX, SheetY + Pad, ContentW, 32),
            Font = StreetTheme.Condensed(20f, FontStyle.Bold), ForeColor = StreetTheme.Ink
        });
        summary.SetBounds(ContentX, 90, ContentW, 20);
        summary.Font = StreetTheme.Body(10);
        summary.ForeColor = StreetTheme.Muted;
        Controls.Add(summary);

        list.Bounds = new Rectangle(ContentX, 118, ContentW, 392);
        list.EmptyText = "Nobody is online right now. Open the game and be the first.";
        Controls.Add(list);

        closeButton.Kind = SlantKind.Text;
        closeButton.Align = StringAlignment.Far;
        closeButton.Text = "Close";
        closeButton.Font = StreetTheme.Body(10);
        closeButton.Bounds = new Rectangle(ContentX + ContentW - 150, 522, 150, 32);
        closeButton.Click += (_, _) => Close();
        Controls.Add(closeButton);
        CancelButton = closeButton;

        poll.Tick += async (_, _) => await Refresh();
        Shown += async (_, _) => { poll.Start(); await Refresh(); };
        FormClosed += (_, _) => poll.Dispose();
        scaler.Capture();
    }

    // Legend of the three symbols, drawn with the same shapes as the list.
    sealed class LegendPanel : Control
    {
        public LegendPanel()
        {
            SetStyle(ControlStyles.UserPaint | ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.SupportsTransparentBackColor, true);
            BackColor = Color.Transparent;
        }

        protected override void OnPaintBackground(PaintEventArgs e) => StreetTheme.PaintBehind(this, e.Graphics);

        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics;
            StreetTheme.PaintBehind(this, g);
            g.SmoothingMode = SmoothingMode.AntiAlias;
            float k = StreetTheme.K(this);
            using var font = new Font("Segoe UI", 13f * k, GraphicsUnit.Pixel);
            var items = new[]
            {
                (LobbyState.Online, "Online, in the menus"),
                (LobbyState.Searching, "Searching for a match"),
                (LobbyState.InMatch, "In a match")
            };
            int y = 0;
            foreach (var (state, text) in items)
            {
                float symbol = 12 * k;
                LobbyList_DrawSymbol(g, state, new RectangleF(2 * k, y + 5 * k, symbol, symbol));
                TextRenderer.DrawText(g, text, font, new Rectangle((int)(26 * k), y, Width - (int)(26 * k), (int)(26 * k)), StreetTheme.Ink,
                    TextFormatFlags.VerticalCenter | TextFormatFlags.NoPadding | TextFormatFlags.SingleLine);
                y += (int)(28 * k);
            }
        }

        static void LobbyList_DrawSymbol(Graphics g, LobbyState state, RectangleF box)
        {
            switch (state)
            {
                case LobbyState.Online:
                    using (var brush = new SolidBrush(Color.FromArgb(86, 214, 120))) g.FillEllipse(brush, box);
                    break;
                case LobbyState.Searching:
                {
                    float width = 2.4f * box.Width / 12f;
                    using var pen = new Pen(StreetTheme.Yellow, width);
                    g.DrawEllipse(pen, RectangleF.Inflate(box, -width / 2, -width / 2));
                    float core = box.Width * 0.3f;
                    using var dot = new SolidBrush(StreetTheme.Yellow);
                    g.FillEllipse(dot, box.X + (box.Width - core) / 2, box.Y + (box.Height - core) / 2, core, core);
                    break;
                }
                default:
                {
                    var triangle = new[]
                    {
                        new PointF(box.X + box.Width * 0.18f, box.Y), new PointF(box.Right, box.Y + box.Height / 2), new PointF(box.X + box.Width * 0.18f, box.Bottom)
                    };
                    using var brush = new SolidBrush(Color.FromArgb(90, 170, 255));
                    g.FillPolygon(brush, triangle);
                    break;
                }
            }
        }
    }

    protected override void OnPaintBackground(PaintEventArgs e)
    {
        BuildScene();
        using (var floor = new SolidBrush(StreetTheme.Asphalt)) e.Graphics.FillRectangle(floor, ClientRectangle);
        e.Graphics.DrawImageUnscaled(scene!, 0, 0);
    }

    void BuildScene()
    {
        float s = ClientSize.Width / (float)StreetTheme.DesignWidth;
        var size = new Size(ClientSize.Width, (int)Math.Ceiling(DesignHeight * s));
        if (scene != null && sceneSize == size) return;
        scene?.Dispose();
        sceneSize = size;
        using var backdrop = StreetTheme.RenderBackdrop(size, StreetTheme.DesignWidth, DesignHeight);
        using var blurred = StreetTheme.Blur(backdrop, 10);
        scene = new Bitmap(backdrop);
        using var g = Graphics.FromImage(scene);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAliasGridFit;
        g.ScaleTransform(s, s);

        StreetTheme.DrawGlass(g, blurred, s, new RectangleF(SheetX, SheetY, SheetW, SheetH), 16);

        using (var small = new Font(StreetTheme.CondensedFamily, 16, FontStyle.Bold, GraphicsUnit.Pixel))
        using (var yellow = new SolidBrush(StreetTheme.Yellow))
            StreetTheme.DrawSpaced(g, "FIFA STREET 2012 RECOMPILED", small, yellow, new PointF(Left, 56), 3.2f);
        StreetTheme.DrawWordmark(g, "ReStreet", new PointF(Left, 88), 118, StreetTheme.Ink);
        var tag = new RectangleF(Left, 192, 236, 32);
        using (var bar = new SolidBrush(StreetTheme.Yellow)) g.FillPolygon(bar, StreetTheme.Slant(tag, 10));
        using (var tagFont = new Font(StreetTheme.CondensedFamily, 16, FontStyle.Bold, GraphicsUnit.Pixel))
        using (var dark = new SolidBrush(StreetTheme.YellowDark))
            StreetTheme.DrawSpaced(g, "LOBBY · ONLINE BETA", tagFont, dark, new PointF(Left + 12, 198), 2.6f);

        using var name = new Font("Segoe UI", 15, FontStyle.Regular, GraphicsUnit.Pixel);
        StreetTheme.DrawLabelValue(g, "Ported by:", "SamuelitoDaVila", name, StreetTheme.Ink, StreetTheme.Ink, Left, 534);
        StreetTheme.DrawLabelValue(g, "Contributions:", "Emran_Ahm3d", name, StreetTheme.Muted, StreetTheme.Muted, Left, 557);
    }

    // Sample rows for the --preview-lobby screenshot.
    internal void PreviewRows()
    {
        previewing = true;
        poll.Stop();
        connection.Text = "Connected · 42 ms to the server";
        ApplyRows(
            new[] { ("StreetKing", "Division · 5-a-side", 14), ("NightFox", "Division · Futsal", 9), ("Kaito_77", "Division · 6-a-side", 3) },
            new[] { "Lola", "Rafa10", "Zed", "Mika" },
            new[] { "Dante", "Nina_K" },
            false, 64);
    }

    string Url(string path) => "http://" + server + ":29812" + path;

    static string Waited(int seconds) => seconds < 60 ? seconds + " s" : (seconds / 60) + " min " + (seconds % 60) + " s";

    void ApplyRows((string Name, string Mode, int Waited)[] searching, string[] online, string[] inMatch, bool paused, int maxOnline)
    {
        var rows = new List<LobbyRow>();
        if (searching.Length > 0)
        {
            rows.Add(new LobbyRow(LobbyState.Header, "SEARCHING FOR A MATCH · " + searching.Length));
            rows.AddRange(searching.OrderByDescending(s => s.Waited)
                .Select(s => new LobbyRow(LobbyState.Searching, s.Name, s.Mode + " · " + Waited(s.Waited), IsMe(s.Name))));
        }
        if (inMatch.Length > 0)
        {
            rows.Add(new LobbyRow(LobbyState.Header, "IN A MATCH · " + inMatch.Length));
            rows.AddRange(inMatch.OrderBy(n => n, StringComparer.OrdinalIgnoreCase).Select(n => new LobbyRow(LobbyState.InMatch, n, "In a match", IsMe(n))));
        }
        if (online.Length > 0)
        {
            rows.Add(new LobbyRow(LobbyState.Header, "ONLINE · " + online.Length));
            rows.AddRange(online.OrderBy(n => n, StringComparer.OrdinalIgnoreCase).Select(n => new LobbyRow(LobbyState.Online, n, "In the menus", IsMe(n))));
        }
        int total = searching.Length + online.Length + inMatch.Length;
        summary.Text = total + " online · " + searching.Length + " searching · " + inMatch.Length + " in a match"
                       + (paused ? " · matchmaking paused" : "");
        list.SetRows(rows);
    }

    bool IsMe(string name) => string.Equals(name, me, StringComparison.OrdinalIgnoreCase);

    async Task Refresh()
    {
        if (busy || previewing) return;
        busy = true;
        try
        {
            var watch = Stopwatch.StartNew();
            string text = await Http.GetStringAsync(Url("/v1/online"));
            int ping = (int)watch.ElapsedMilliseconds;
            using var doc = JsonDocument.Parse(text);
            var root = doc.RootElement;
            connection.ForeColor = StreetTheme.Muted;
            connection.Text = "Connected · " + ping + " ms to the server";

            var searching = new List<(string, string, int)>();
            if (root.TryGetProperty("searching_list", out var searchList) && searchList.ValueKind == JsonValueKind.Array)
                foreach (var item in searchList.EnumerateArray())
                    searching.Add((item.GetProperty("name").GetString() ?? "?", item.GetProperty("mode").GetString() ?? "?",
                        item.TryGetProperty("waited_s", out var w) && w.TryGetInt32(out var seconds) ? seconds : 0));
            var online = new List<string>();
            var inMatch = new List<string>();
            if (root.TryGetProperty("players", out var players) && players.ValueKind == JsonValueKind.Array)
                foreach (var item in players.EnumerateArray())
                {
                    string name = item.GetProperty("name").GetString() ?? "?";
                    string state = item.TryGetProperty("state", out var s) ? s.GetString() ?? "" : "";
                    if (state == "online") online.Add(name);
                    else if (state == "in_game") inMatch.Add(name);
                }
            bool paused = root.TryGetProperty("matchmaking_paused", out var p) && p.ValueKind == JsonValueKind.True;
            int max = root.TryGetProperty("max_online", out var m) && m.TryGetInt32(out var maxValue) ? maxValue : 0;
            ApplyRows(searching.ToArray(), online.ToArray(), inMatch.ToArray(), paused, max);
        }
        catch (Exception error) when (error is HttpRequestException or TaskCanceledException or JsonException or KeyNotFoundException)
        {
            connection.ForeColor = Color.FromArgb(255, 120, 110);
            connection.Text = "Cannot reach the server. Check your internet connection.";
        }
        finally { busy = false; }
    }
}
