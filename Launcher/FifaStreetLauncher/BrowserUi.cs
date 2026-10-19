using System.Collections.Concurrent;
using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;

namespace FifaStreetLauncher;

// The new launcher page without WebView2 (Wine/Proton, or a Windows without the runtime): the same ui/launcher.html is
// served on 127.0.0.1 only, under a random secret path, and opened in the system browser. The page talks to the
// launcher with POST <secret>/msg and long-polls GET <secret>/events; everything else stays as with WebView2. The
// classic window is hidden, and the launcher exits when the page has been closed for a while and no game is running.
public partial class LauncherForm
{
    private TcpListener? browserListener;
    private string browserSecret = "";
    private bool browserActive;
    private DateTime browserLastSeen = DateTime.UtcNow;
    private readonly ConcurrentQueue<string> browserOutbox = new();
    private readonly SemaphoreSlim browserSignal = new(0);

    [DllImport("kernel32.dll", CharSet = CharSet.Ansi)] private static extern IntPtr GetModuleHandleA(string name);
    [DllImport("kernel32.dll", CharSet = CharSet.Ansi)] private static extern IntPtr GetProcAddress(IntPtr module, string name);

    // Wine (and Proton) export wine_get_version from ntdll; WebView2 is not reliable there.
    internal static bool RunningOnWine()
    {
        IntPtr ntdll = GetModuleHandleA("ntdll.dll");
        return ntdll != IntPtr.Zero && GetProcAddress(ntdll, "wine_get_version") != IntPtr.Zero;
    }

    private bool PageConnected => glass?.CoreWebView2 != null || browserActive;

    // Every message for the page goes through here, whichever way the page is shown.
    private void SendToPage(string json)
    {
        if (browserActive)
        {
            browserOutbox.Enqueue(json);
            browserSignal.Release();
            return;
        }
        if (InvokeRequired) BeginInvoke(() => glass?.CoreWebView2?.PostWebMessageAsJson(json));
        else glass?.CoreWebView2?.PostWebMessageAsJson(json);
    }

    private void StartBrowserUi()
    {
        if (browserActive) return;
        string ui = Path.Combine(AppContext.BaseDirectory, "ui");
        if (!File.Exists(Path.Combine(ui, "launcher.html"))) return;  // no page: the classic window stays
        browserSecret = Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant();
        browserListener = new TcpListener(IPAddress.Loopback, 0);
        browserListener.Start();
        browserActive = true;
        browserLastSeen = DateTime.UtcNow;
        int port = ((IPEndPoint)browserListener.LocalEndpoint).Port;
        _ = Task.Run(() => AcceptBrowserClients(ui));
        string url = $"http://127.0.0.1:{port}/{browserSecret}/launcher.html";
        try
        {
            // A window of its own, the launcher's size, when a Chromium browser is there; otherwise the default browser.
            if (!OpenAppWindow(url)) Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
        }
        catch (Exception ex) when (ex is System.ComponentModel.Win32Exception or InvalidOperationException)
        {
            browserActive = false;  // no browser to open: keep the classic window
            browserListener.Stop();
            return;
        }
        // Only the new interface is shown: hide the classic window (it keeps launching the game and restoring the display).
        Opacity = 0;
        ShowInTaskbar = false;
        var watchdog = new System.Windows.Forms.Timer { Interval = 15000 };
        watchdog.Tick += (_, _) =>
        {
            if (!gameRunning && !updating && DateTime.UtcNow - browserLastSeen > TimeSpan.FromSeconds(90)) Close();
        };
        watchdog.Start();
    }

    // Chromium-family browsers open a URL as an app window (no tabs, no address bar) with --app; a profile of its own
    // makes it a new window of the requested size even when the browser is already open.
    private bool OpenAppWindow(string url)
    {
        string size = $"--window-size={Width},{Height}";
        if (RunningOnWine())
        {
            string[] unix =
            {
                "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome-stable", "/usr/bin/google-chrome",
                "/usr/bin/brave", "/usr/bin/brave-browser", "/usr/bin/microsoft-edge-stable", "/usr/bin/vivaldi-stable",
                "/var/lib/flatpak/exports/bin/org.chromium.Chromium", "/var/lib/flatpak/exports/bin/com.google.Chrome",
                "/var/lib/flatpak/exports/bin/com.brave.Browser", "/var/lib/flatpak/exports/bin/com.microsoft.Edge",
            };
            // Wine maps the Linux root to Z:, and start.exe /unix runs a Linux program.
            string? found = unix.FirstOrDefault(p => File.Exists("Z:" + p.Replace('/', '\\')));
            if (found == null) return false;
            Process.Start(new ProcessStartInfo("start.exe")
            {
                ArgumentList = { "/unix", found, "--app=" + url, size, "--user-data-dir=/tmp/restreet-launcher-ui" },
                UseShellExecute = false, CreateNoWindow = true,
            });
            return true;
        }
        string pf = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
        string pf86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
        string local = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        string? exe = new[]
        {
            Path.Combine(pf86, @"Microsoft\Edge\Application\msedge.exe"), Path.Combine(pf, @"Microsoft\Edge\Application\msedge.exe"),
            Path.Combine(pf, @"Google\Chrome\Application\chrome.exe"), Path.Combine(pf86, @"Google\Chrome\Application\chrome.exe"),
            Path.Combine(local, @"Google\Chrome\Application\chrome.exe"),
            Path.Combine(pf, @"BraveSoftware\Brave-Browser\Applicationrave.exe"),
        }.FirstOrDefault(File.Exists);
        if (exe == null) return false;
        Process.Start(new ProcessStartInfo(exe)
        {
            ArgumentList = { "--app=" + url, size, "--user-data-dir=" + Path.Combine(local, "ReStreet", "LauncherWindow") },
            UseShellExecute = false,
        });
        return true;
    }

    private async Task AcceptBrowserClients(string ui)
    {
        while (browserActive && browserListener != null)
        {
            TcpClient client;
            try { client = await browserListener.AcceptTcpClientAsync(); }
            catch (Exception ex) when (ex is SocketException or ObjectDisposedException or InvalidOperationException) { return; }
            _ = Task.Run(() => ServeBrowserClient(client, ui));
        }
    }

    private async Task ServeBrowserClient(TcpClient client, string ui)
    {
        using var _ = client;
        try
        {
            var stream = client.GetStream();
            var (method, path, body) = await ReadRequest(stream);
            string prefix = "/" + browserSecret + "/";
            if (!path.StartsWith(prefix, StringComparison.Ordinal)) { await Respond(stream, 404, "text/plain", Array.Empty<byte>()); return; }
            string rest = path[prefix.Length..].Split('?')[0];
            browserLastSeen = DateTime.UtcNow;
            if (method == "POST" && rest == "msg")
            {
                string json = Encoding.UTF8.GetString(body);
                BeginInvoke(() => OnGlassMessage(json));
                await Respond(stream, 204, "text/plain", Array.Empty<byte>());
            }
            else if (method == "GET" && rest == "events")
            {
                // Long poll: answer at once when something is queued, otherwise after 20 s with an empty list.
                await browserSignal.WaitAsync(TimeSpan.FromSeconds(20));
                var items = new List<string>();
                while (browserOutbox.TryDequeue(out var item)) items.Add(item);
                await Respond(stream, 200, "application/json", Encoding.UTF8.GetBytes("[" + string.Join(",", items) + "]"));
            }
            else if (method == "GET" && rest.Length > 0 && rest.IndexOfAny(new[] { '/', '\\' }) < 0 && !rest.Contains(".."))
            {
                string file = Path.Combine(ui, rest);
                string type = Path.GetExtension(file).ToLowerInvariant() switch
                {
                    ".html" => "text/html; charset=utf-8", ".jpg" => "image/jpeg", ".png" => "image/png",
                    ".css" => "text/css", ".js" => "text/javascript", _ => "application/octet-stream",
                };
                if (File.Exists(file)) await Respond(stream, 200, type, await File.ReadAllBytesAsync(file));
                else await Respond(stream, 404, "text/plain", Array.Empty<byte>());
            }
            else await Respond(stream, 404, "text/plain", Array.Empty<byte>());
        }
        catch (Exception ex) when (ex is IOException or SocketException or ObjectDisposedException or InvalidOperationException) { }
    }

    private static async Task<(string Method, string Path, byte[] Body)> ReadRequest(NetworkStream stream)
    {
        var head = new List<byte>();
        var one = new byte[1];
        while (head.Count < 16384 && await stream.ReadAsync(one) == 1)
        {
            head.Add(one[0]);
            int n = head.Count;
            if (n >= 4 && head[n - 4] == '\r' && head[n - 3] == '\n' && head[n - 2] == '\r' && head[n - 1] == '\n') break;
        }
        string[] lines = Encoding.ASCII.GetString(head.ToArray()).Split("\r\n");
        string[] first = lines[0].Split(' ');
        if (first.Length < 2) throw new IOException("bad request");
        int length = 0;
        foreach (string line in lines)
            if (line.StartsWith("Content-Length:", StringComparison.OrdinalIgnoreCase)) int.TryParse(line[15..].Trim(), out length);
        length = Math.Clamp(length, 0, 65536);
        var body = new byte[length];
        for (int read = 0; read < length;)
        {
            int got = await stream.ReadAsync(body.AsMemory(read));
            if (got == 0) break;
            read += got;
        }
        return (first[0], first[1], body);
    }

    private static async Task Respond(NetworkStream stream, int status, string type, byte[] body)
    {
        string reason = status switch { 200 => "OK", 204 => "No Content", _ => "Not Found" };
        string header = $"HTTP/1.1 {status} {reason}\r\nContent-Type: {type}\r\nContent-Length: {body.Length}\r\n" +
                        "Cache-Control: no-store\r\nConnection: close\r\n\r\n";
        await stream.WriteAsync(Encoding.ASCII.GetBytes(header));
        if (body.Length > 0) await stream.WriteAsync(body);
    }
}
