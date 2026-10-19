using System;
using System.Buffers.Binary;
using System.Collections.Generic;
using System.IO;
using System.IO.Pipes;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace FifaStreetLauncher;

/// <summary>
/// What the Discord card shows. Every field is optional; the ones left null are
/// omitted from the payload, which is what Discord expects.
/// </summary>
public sealed class DiscordActivity
{
    /// <summary>First line under the application name.</summary>
    public string? Details { get; set; }

    /// <summary>Second line, used here for the renderer and video mode.</summary>
    public string? State { get; set; }

    /// <summary>When the session started; Discord counts up from it.</summary>
    public DateTimeOffset? Start { get; set; }

    /// <summary>Art asset key uploaded in the Discord developer portal.</summary>
    public string? LargeImage { get; set; }
    public string? LargeText { get; set; }
    public string? SmallImage { get; set; }
    public string? SmallText { get; set; }

    /// <summary>At most two; Discord drops the rest.</summary>
    public List<DiscordButton>? Buttons { get; set; }

    public bool SameAs(DiscordActivity? other) =>
        other is not null &&
        Details == other.Details && State == other.State &&
        Start == other.Start &&
        LargeImage == other.LargeImage && LargeText == other.LargeText &&
        SmallImage == other.SmallImage && SmallText == other.SmallText;
}

public sealed class DiscordButton
{
    public string Label { get; set; } = "";
    public string Url { get; set; } = "";
}

/// <summary>
/// Minimal Discord Rich Presence client: it speaks the local IPC protocol over
/// the named pipe Discord opens on the same PC, so it needs no NuGet package and
/// no network access of its own.
///
/// Everything here is best-effort. If Discord is not installed, not running, or
/// closes mid-game, the client keeps quiet and retries in the background. It
/// never throws into the launcher and never blocks the game from starting.
/// </summary>
public sealed class DiscordPresence : IDisposable
{
    private const int OpHandshake = 0;
    private const int OpFrame = 1;
    private const int OpClose = 2;
    private const int OpPing = 3;
    private const int OpPong = 4;

    // Discord allows 5 presence updates per 20 seconds. One per 15 is well inside it.
    private static readonly TimeSpan MinUpdateInterval = TimeSpan.FromSeconds(15);
    private static readonly TimeSpan ReconnectInterval = TimeSpan.FromSeconds(10);

    private readonly string clientId;
    private readonly int gamePid;
    private readonly CancellationTokenSource cancel = new();
    private readonly SemaphoreSlim writeGate = new(1, 1);

    private NamedPipeClientStream? pipe;
    private Task? worker;
    private Task? reader;

    private DiscordActivity? wanted;      // what we would like Discord to show
    private DiscordActivity? shown;       // what Discord has been told
    private DateTime lastSend = DateTime.MinValue;
    private DateTime lastConnectAttempt = DateTime.MinValue;
    private int disposed;

    public DiscordPresence(string clientId, int gamePid)
    {
        this.clientId = clientId;
        this.gamePid = gamePid;
    }

    /// <summary>True once the handshake has gone through.</summary>
    public bool Connected => pipe is { IsConnected: true };

    /// <summary>Set or replace the activity. Safe to call from the UI thread.</summary>
    public void Set(DiscordActivity activity)
    {
        Volatile.Write(ref wanted, activity);
        if (worker is null && Volatile.Read(ref disposed) == 0)
            worker = Task.Run(() => WorkerAsync(cancel.Token));
    }

    private async Task WorkerAsync(CancellationToken token)
    {
        try
        {
            while (!token.IsCancellationRequested)
            {
                if (!Connected)
                {
                    if (DateTime.UtcNow - lastConnectAttempt >= ReconnectInterval)
                    {
                        lastConnectAttempt = DateTime.UtcNow;
                        if (await TryConnectAsync(token).ConfigureAwait(false))
                        {
                            // A fresh connection knows nothing, so resend.
                            shown = null;
                            lastSend = DateTime.MinValue;
                        }
                    }
                }
                else
                {
                    var target = Volatile.Read(ref wanted);
                    if (target is not null && !target.SameAs(shown) &&
                        DateTime.UtcNow - lastSend >= MinUpdateInterval)
                    {
                        if (await TrySendActivityAsync(target, token).ConfigureAwait(false))
                        {
                            shown = target;
                            lastSend = DateTime.UtcNow;
                        }
                        else
                        {
                            Drop();
                        }
                    }
                }

                await Task.Delay(1000, token).ConfigureAwait(false);
            }
        }
        catch (OperationCanceledException)
        {
            // Shutting down.
        }
        catch
        {
            // Presence is cosmetic; never surface a failure.
        }
    }

    private async Task<bool> TryConnectAsync(CancellationToken token)
    {
        for (int i = 0; i < 10; i++)
        {
            NamedPipeClientStream? candidate = null;
            try
            {
                candidate = new NamedPipeClientStream(
                    ".", "discord-ipc-" + i, PipeDirection.InOut, PipeOptions.Asynchronous);

                await candidate.ConnectAsync(500, token).ConfigureAwait(false);

                pipe = candidate;
                candidate = null;

                var handshake = JsonSerializer.Serialize(new Dictionary<string, object?>
                {
                    ["v"] = 1,
                    ["client_id"] = clientId
                });

                if (!await WriteFrameAsync(OpHandshake, handshake, token).ConfigureAwait(false))
                {
                    Drop();
                    continue;
                }

                reader = Task.Run(() => ReadLoopAsync(pipe!, token));
                return true;
            }
            catch (OperationCanceledException) when (token.IsCancellationRequested)
            {
                candidate?.Dispose();
                throw;
            }
            catch
            {
                // That slot is not Discord, or Discord is busy. Try the next one.
                candidate?.Dispose();
                Drop();
            }
        }
        return false;
    }

    /// <summary>
    /// Every command gets a reply frame, and Discord sends the occasional PING.
    /// Without draining them the pipe buffer eventually fills and our writes
    /// would block, so one task reads and discards continuously.
    /// </summary>
    private async Task ReadLoopAsync(NamedPipeClientStream stream, CancellationToken token)
    {
        var header = new byte[8];
        try
        {
            while (!token.IsCancellationRequested && stream.IsConnected)
            {
                if (!await ReadExactAsync(stream, header, 8, token).ConfigureAwait(false))
                    break;

                int op = BinaryPrimitives.ReadInt32LittleEndian(header.AsSpan(0, 4));
                int length = BinaryPrimitives.ReadInt32LittleEndian(header.AsSpan(4, 4));
                if (length < 0 || length > 1 << 20) break;

                var body = length > 0 ? new byte[length] : Array.Empty<byte>();
                if (length > 0 && !await ReadExactAsync(stream, body, length, token).ConfigureAwait(false))
                    break;

                if (op == OpPing)
                {
                    await WriteFrameAsync(OpPong, Encoding.UTF8.GetString(body), token).ConfigureAwait(false);
                }
                else if (op == OpClose)
                {
                    break;
                }
                // Everything else (READY, command replies, events) is of no use here.
            }
        }
        catch
        {
            // Fall through: the worker notices the pipe is gone and reconnects.
        }
        finally
        {
            if (ReferenceEquals(stream, pipe) && Volatile.Read(ref disposed) == 0) Drop();
        }
    }

    private static async Task<bool> ReadExactAsync(
        Stream stream, byte[] buffer, int count, CancellationToken token)
    {
        int read = 0;
        while (read < count)
        {
            int got = await stream.ReadAsync(buffer.AsMemory(read, count - read), token).ConfigureAwait(false);
            if (got <= 0) return false;
            read += got;
        }
        return true;
    }

    private async Task<bool> TrySendActivityAsync(DiscordActivity? activity, CancellationToken token)
    {
        var args = new Dictionary<string, object?>
        {
            ["pid"] = gamePid,
            ["activity"] = activity is null ? null : BuildActivity(activity)
        };

        var command = new Dictionary<string, object?>
        {
            ["cmd"] = "SET_ACTIVITY",
            ["nonce"] = Guid.NewGuid().ToString(),
            ["args"] = args
        };

        return await WriteFrameAsync(OpFrame, JsonSerializer.Serialize(command), token).ConfigureAwait(false);
    }

    private static Dictionary<string, object?> BuildActivity(DiscordActivity a)
    {
        var payload = new Dictionary<string, object?> { ["instance"] = false };

        if (!string.IsNullOrWhiteSpace(a.Details)) payload["details"] = Trim(a.Details!, 128);
        if (!string.IsNullOrWhiteSpace(a.State)) payload["state"] = Trim(a.State!, 128);

        if (a.Start is { } start)
        {
            payload["timestamps"] = new Dictionary<string, object?>
            {
                ["start"] = start.ToUnixTimeSeconds()
            };
        }

        var assets = new Dictionary<string, object?>();
        if (!string.IsNullOrWhiteSpace(a.LargeImage)) assets["large_image"] = a.LargeImage;
        if (!string.IsNullOrWhiteSpace(a.LargeText)) assets["large_text"] = Trim(a.LargeText!, 128);
        if (!string.IsNullOrWhiteSpace(a.SmallImage)) assets["small_image"] = a.SmallImage;
        if (!string.IsNullOrWhiteSpace(a.SmallText)) assets["small_text"] = Trim(a.SmallText!, 128);
        if (assets.Count > 0) payload["assets"] = assets;

        if (a.Buttons is { Count: > 0 })
        {
            var buttons = new List<Dictionary<string, object?>>();
            foreach (var b in a.Buttons)
            {
                if (string.IsNullOrWhiteSpace(b.Label) || string.IsNullOrWhiteSpace(b.Url)) continue;
                buttons.Add(new Dictionary<string, object?>
                {
                    ["label"] = Trim(b.Label, 32),
                    ["url"] = b.Url
                });
                if (buttons.Count == 2) break;
            }
            if (buttons.Count > 0) payload["buttons"] = buttons;
        }

        return payload;
    }

    private static string Trim(string text, int max) =>
        text.Length <= max ? text : text.Substring(0, max);

    private async Task<bool> WriteFrameAsync(int op, string json, CancellationToken token)
    {
        var stream = pipe;
        if (stream is null || !stream.IsConnected) return false;

        var payload = Encoding.UTF8.GetBytes(json);
        var frame = new byte[8 + payload.Length];
        BinaryPrimitives.WriteInt32LittleEndian(frame.AsSpan(0, 4), op);
        BinaryPrimitives.WriteInt32LittleEndian(frame.AsSpan(4, 4), payload.Length);
        payload.CopyTo(frame, 8);

        await writeGate.WaitAsync(token).ConfigureAwait(false);
        try
        {
            await stream.WriteAsync(frame.AsMemory(0, frame.Length), token).ConfigureAwait(false);
            await stream.FlushAsync(token).ConfigureAwait(false);
            return true;
        }
        catch (OperationCanceledException) when (token.IsCancellationRequested)
        {
            throw;
        }
        catch
        {
            return false;
        }
        finally
        {
            writeGate.Release();
        }
    }

    private void Drop()
    {
        var stream = pipe;
        pipe = null;
        shown = null;
        try { stream?.Dispose(); } catch { }
    }

    /// <summary>
    /// Clears the card and closes the pipe. Discord also clears the activity by
    /// itself when the pipe drops, so this is a courtesy with a short budget.
    /// </summary>
    public void Dispose()
    {
        if (Interlocked.Exchange(ref disposed, 1) != 0) return;

        try
        {
            if (Connected)
            {
                using var quick = new CancellationTokenSource(TimeSpan.FromMilliseconds(500));
                TrySendActivityAsync(null, quick.Token).GetAwaiter().GetResult();
            }
        }
        catch { }

        try { cancel.Cancel(); } catch { }
        Drop();
        try { cancel.Dispose(); } catch { }
        try { writeGate.Dispose(); } catch { }
    }
}
