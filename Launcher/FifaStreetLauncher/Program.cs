using System;
using System.Windows.Forms;

namespace FifaStreetLauncher;

internal static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();
        // --preview-lobby <png>: the lobby window with sample players and no server.
        if (args.Length >= 2 && args[0] == "--preview-lobby")
        {
            using var lobby = new LobbyForm("127.0.0.1", "SamuelitoDaVila");
            lobby.Show();
            lobby.PreviewRows();
            Application.DoEvents();
            using var shot = new System.Drawing.Bitmap(lobby.Width, lobby.Height);
            lobby.DrawToBitmap(shot, new System.Drawing.Rectangle(System.Drawing.Point.Empty, lobby.Size));
            shot.Save(args[1]);
            return;
        }
        // --preview-friends <png>: the friends window with sample rows and no server (127.0.0.1 refuses the connection).
        if (args.Length >= 2 && args[0] == "--preview-friends")
        {
            using var friends = new FriendsForm("127.0.0.1", "SamuelitoDaVila", new string('a', 32));
            friends.Show();
            friends.PreviewRows();
            Application.DoEvents();
            using var shot = new System.Drawing.Bitmap(friends.Width, friends.Height);
            friends.DrawToBitmap(shot, new System.Drawing.Rectangle(System.Drawing.Point.Empty, friends.Size));
            shot.Save(args[1]);
            return;
        }
        if (args.Length >= 2 && args[0] == "--preview")
        {
            using var form = new LauncherForm();
            form.Show();
            if (args.Length > 2)
            {
                var method = typeof(LauncherForm).GetMethod(args[2] == "advanced" ? "ToggleAdvanced" : "ToggleCompatibility", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                method!.Invoke(form, null);
            }
            Application.DoEvents();
            using var bitmap = new System.Drawing.Bitmap(form.Width, form.Height);
            form.DrawToBitmap(bitmap, new System.Drawing.Rectangle(System.Drawing.Point.Empty, form.Size));
            bitmap.Save(args[1]);
            return;
        }
        if (Array.Exists(args, a => a.Equals("--play", StringComparison.OrdinalIgnoreCase)))
        {
            // Direct play: no window, starts the game with the settings saved by the launcher.
            var direct = new LauncherForm();
            direct.StartDirect();
            Application.Run(direct);
            return;
        }
        Application.Run(new LauncherForm());
    }
}
