// Snapshot of the latest GitHub releases (offline fallback; the page refreshes it from the GitHub API when online).
window.RELEASES = [
 {
  "tag_name": "v2.0.4-online-beta",
  "name": "ReStreet v2.0.4 — ONLINE BETA (sign-in fix)",
  "published_at": "2026-10-19T23:33:57Z",
  "body": "# ReStreet 2.0.4 — Online Beta (sign-in fix)\n\nOpen the launcher and click **Update**. Your name, server, settings and World Tour progress are kept.\n\n## Fixed\n- **\"SIGN IN FAILED\" / `OSDK_SIGNIN_REQUIRED` on 2.0.3.** The 2.0.3 game was built without its online sign-in part, so nobody could go online. 2.0.4 puts it back.\n- Keeps the 2.0.3 fixes: World Tour no longer closes the game when leaving a match, and saving no longer closes the game when the Documents folder can't be used.\n\n## Still known\n- **Player portraits in World Tour (My Squad) look scrambled.** We're working on it.\n- \"Download not available\" for some World Tour teams: a harmless server message, you can keep playing.\n\nNew player? Download `ReStreet-2.0.4-Setup.exe`.\n",
  "html_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/tag/v2.0.4-online-beta",
  "assets": [
   {
    "name": "ReStreet-2.0.4-Setup.exe",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v2.0.4-online-beta/ReStreet-2.0.4-Setup.exe"
   },
   {
    "name": "ReStreet-2.0.4-Setup.exe.sha256",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v2.0.4-online-beta/ReStreet-2.0.4-Setup.exe.sha256"
   }
  ]
 },
 {
  "tag_name": "v2.0.3-online-beta",
  "name": "ReStreet v2.0.3 — ONLINE BETA (World Tour crash fixes)",
  "published_at": "2026-10-19T22:56:51Z",
  "body": "# ReStreet 2.0.3 — Online Beta (World Tour crash fixes)\n\nOpen the launcher and click **Update**. Your name, server, settings and World Tour progress are kept.\n\n## Fixed\n- **World Tour closed the game when leaving a match** (after playing or quitting). A piece of the game's code that World Tour calls at the end of a match was missing in 2.0.\n- **The game closed when saving** if Windows' Documents folder can't be used (for example a OneDrive folder that is missing or blocked). The game now reports the error instead of closing, and if Documents can't be used it saves in `Binaries\\UserData` next to the game.\n\n## Still known\n- **Player portraits in World Tour (My Squad) look scrambled.** We're working on it for the next update.\n- \"Download not available\" for some World Tour teams: a harmless server message, you can keep playing.\n- Same limits as 2.0: no mouse for skill moves yet, small stutters on Vulkan (use Direct3D 12), chat only in the launcher.\n\nNew player? Download `ReStreet-2.0.3-Setup.exe`.\n",
  "html_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/tag/v2.0.3-online-beta",
  "assets": [
   {
    "name": "ReStreet-2.0.3-Setup.exe",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v2.0.3-online-beta/ReStreet-2.0.3-Setup.exe"
   },
   {
    "name": "ReStreet-2.0.3-Setup.exe.sha256",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v2.0.3-online-beta/ReStreet-2.0.3-Setup.exe.sha256"
   }
  ]
 },
 {
  "tag_name": "v2.0.2-online-beta",
  "name": "ReStreet v2.0.2 — ONLINE BETA (World Tour saves restored)",
  "published_at": "2026-10-19T21:03:02Z",
  "body": "# ReStreet 2.0.2 — Online Beta (World Tour saves restored)\n\n**Your World Tour progress is back.** 2.0 looked for saves in a new, empty profile folder, so the game started from zero. Nothing was deleted: 2.0.2 loads the same saves as 1.5 again (`Documents\\fifastreet\\B13EBABEBABEBABE`).\n\nNote: anything played on 2.0 / 2.0.1 before this update stays in its own folder and is not merged.\n\nAlso includes the 2.0.1 sign-in fix. Open the launcher and click Update, or download `ReStreet-2.0.2-Setup.exe`.\n",
  "html_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/tag/v2.0.2-online-beta",
  "assets": [
   {
    "name": "ReStreet-2.0.2-Setup.exe",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v2.0.2-online-beta/ReStreet-2.0.2-Setup.exe"
   },
   {
    "name": "ReStreet-2.0.2-Setup.exe.sha256",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v2.0.2-online-beta/ReStreet-2.0.2-Setup.exe.sha256"
   }
  ]
 },
 {
  "tag_name": "v2.0.1-online-beta",
  "name": "ReStreet v2.0.1 — ONLINE BETA (sign-in fix)",
  "published_at": "2026-10-19T20:47:42Z",
  "body": "# ReStreet 2.0.1 — Online Beta (sign-in fix)\n\n**Fixes \"SIGN IN FAILED\" on 2.0.** The 2.0 game tried to sign in through a wrong local network address, so it never reached the servers. Your name, server region, settings and World Tour progress are kept on the server: nothing was lost, it just could not load while sign-in failed.\n\nAlready on 2.0 or 1.5.x? Open the launcher and accept the update. New here? Download `ReStreet-2.0.1-Setup.exe`.\n\nEverything else is as in [2.0](https://github.com/samuelit0davila/fifa-street-pc-port/releases/tag/v2.0-online-beta).\n",
  "html_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/tag/v2.0.1-online-beta",
  "assets": [
   {
    "name": "ReStreet-2.0.1-Setup.exe",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v2.0.1-online-beta/ReStreet-2.0.1-Setup.exe"
   },
   {
    "name": "ReStreet-2.0.1-Setup.exe.sha256",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v2.0.1-online-beta/ReStreet-2.0.1-Setup.exe.sha256"
   }
  ]
 },
 {
  "tag_name": "v2.0-online-beta",
  "name": "ReStreet v2.0 — ONLINE BETA",
  "published_at": "2026-10-19T20:21:00Z",
  "body": "# ReStreet 2.0 — Online Beta\n\nA new graphics engine, a launcher with friends, chat and game rooms, and online play that works from start to kick-off.\n\n## What's new\n- **New graphics engine** based on AnDr3zF's \"Deck\" port: sharper image and much higher frame rates (about 400 FPS in a match on the test PC, against about 165 on 1.5.7). Direct3D 12 and Vulkan.\n- **Graphics options:** FSR 1 modes, internal resolution up to 4x, aspect ratio, anisotropic filtering, ambient occlusion (SSAO, HBAO, GTAO), MSAA, FXAA and an FPS limit, the same as the in-game F5 menu.\n- **Launcher:** social page with online players, friends, requests and chat; game rooms that bring both players to the lobby; performance, display, graphics and controls pages.\n- **In-game friends Guide:** F6 or the controller's Xbox button, with your friends list and game invites.\n- **Game invites:** accept with A / Space, decline with B / Shift. Quit an online match with START + B.\n- **Brazilian Portuguese** translation by Eze_, with heights and weights in cm and kg.\n- **One installer** (`ReStreet-2.0-Setup.exe`): installs from your FIFA Street ISO or updates an older ReStreet install. 1.5.x launchers offer the update automatically; your name, server region and settings are kept.\n\n## Tested\nTwo players through the live-like server path (about 180 ms ping): sign-in and News Feed, friend requests, invites (accept and decline), launcher rooms to kick-off, START + B, launcher options (language, monitor) reaching the game. Not yet tested on two separate real PCs by the team, so please report what you find.\n\n## Known limits\n- No mouse for skill moves yet on 2.0 (the launcher option is hidden).\n- Vulkan has small stutters; use Direct3D 12 if you see them.\n- The game always renders internally at 1280x720 and is scaled to your screen.\n- START + B also shows the game's own \"leave this session?\" question behind it; close it with A.\n- A launcher room does not pull a player out of another lobby; leave that lobby first.\n- Chat is only in the launcher, not in the game.\n- Two games on the same PC can lose the connection after an invite (does not affect different PCs).\n\n## Install\nDownload `ReStreet-2.0-Setup.exe` (check it with `ReStreet-2.0-Setup.exe.sha256` if you like) and run it. Already on 1.5.x? Open the launcher and accept the update.\n\nBugs: report them on the Discord.\n\nCredits: SamuelitoDaVila (port, online, launcher, 2.0 integration), AnDr3zF (2.0 \"Deck\" engine base), Eze_ (Brazilian Portuguese).\n",
  "html_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/tag/v2.0-online-beta",
  "assets": [
   {
    "name": "ReStreet-2.0-Setup.exe",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v2.0-online-beta/ReStreet-2.0-Setup.exe"
   },
   {
    "name": "ReStreet-2.0-Setup.exe.sha256",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v2.0-online-beta/ReStreet-2.0-Setup.exe.sha256"
   }
  ]
 },
 {
  "tag_name": "v1.5.7-online-beta",
  "name": "ReStreet v1.5.7 — ONLINE BETA",
  "published_at": "2026-10-18T19:29:20Z",
  "body": "# ReStreet v1.5.7 — ONLINE BETA 🔧\n\nA fix for matches from the launcher's **Matches** tab. On v1.5.1 or newer the launcher offers this update by itself: press **Update now**.\n\n## What's fixed\n\n### Matches no longer get stuck on \"loading\"\n- If your game was **already open** when someone joined your match (or when you joined theirs), the game often stayed on its menu and the match was never created: the other player waited on the loading screen forever.\n- Now the launcher **restarts your game by itself** when the match fills up, and the game goes straight to the match lobby as usual. The launcher tells you when this happens.\n- Tip: you can post or join a match with the game closed or open, both work now.\n\n### Friend invites\n- Invites from a player whose game had crashed earlier could send you to that old, closed game and leave you loading forever. The server now always sends you to the game your friend has open right now.\n\n## How to install\n\n- **On v1.5.1 or newer:** open the launcher and press **Update now**.\n- **On v1.3, v1.4 or v1.5:** close the launcher and the game, run **ReStreet-1.5.7-Online-Beta.exe**, pick your ReStreet folder, your online name and your server.\n\nYour saves, settings and online name are kept.\n",
  "html_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/tag/v1.5.7-online-beta",
  "assets": [
   {
    "name": "ReStreet-1.5.7-Online-Beta.exe",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v1.5.7-online-beta/ReStreet-1.5.7-Online-Beta.exe"
   },
   {
    "name": "ReStreet-1.5.7-Online-Beta.exe.sha256",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v1.5.7-online-beta/ReStreet-1.5.7-Online-Beta.exe.sha256"
   }
  ]
 },
 {
  "tag_name": "v1.5.6-online-beta",
  "name": "ReStreet v1.5.6 — ONLINE BETA",
  "published_at": "2026-10-18T17:21:38Z",
  "body": "# ReStreet v1.5.6 — ONLINE BETA ⚡\n\nA performance update for weaker PCs. On v1.5.1 or newer the launcher offers this update by itself: press **Update now**.\n\n## What's new\n\n### Smoother on 4-core CPUs and laptops\n- While the game waits for the graphics card, it now gives the CPU to the parts that are doing work (graphics commands, audio). Before, those parts sometimes had to wait.\n- In our test on a PC limited to 4 cores / 8 threads, the average went from **145 to 160–171 FPS**. The biggest gain is on PCs that use the whole CPU.\n\n### Better performance reports\n- The launcher's performance report now always records **which graphics card the game really used**, and whether it is a **built-in (integrated) GPU**, on every PC.\n- This tells us which machines struggle, so the next updates can target them.\n\n## How to install\n\n- **On v1.5.1 or newer:** open the launcher and press **Update now**.\n- **On v1.3, v1.4 or v1.5:** close the launcher and the game, run **ReStreet-1.5.6-Online-Beta.exe**, pick your ReStreet folder, your online name and your server.\n\nYour saves, settings and online name are kept.\n\n## Tip if the game feels choppy\nIf the FPS counter is high but the game doesn't feel smooth, turn on **VSync** in the launcher. On a laptop with an NVIDIA card, also set the game to **High-performance NVIDIA processor** in NVIDIA Control Panel → Manage 3D settings → Program settings.\n",
  "html_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/tag/v1.5.6-online-beta",
  "assets": [
   {
    "name": "ReStreet-1.5.6-Online-Beta.exe",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v1.5.6-online-beta/ReStreet-1.5.6-Online-Beta.exe"
   },
   {
    "name": "ReStreet-1.5.6-Online-Beta.exe.sha256",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v1.5.6-online-beta/ReStreet-1.5.6-Online-Beta.exe.sha256"
   }
  ]
 },
 {
  "tag_name": "v1.5.5-online-beta",
  "name": "ReStreet v1.5.5 — ONLINE BETA",
  "published_at": "2026-10-18T08:34:53Z",
  "body": "# ReStreet v1.5.5 — ONLINE BETA 🌍⚽\n\nMatches that open by themselves, stadium photos, keyboard controls, a new folder layout and many fixes. On v1.5.1 or newer the launcher offers this update by itself: press **Update now**.\n\n## What's new\n\n### Matches open by themselves\n- Post a match in the **Matches** tab: as soon as someone joins, **both games open and go straight to the match lobby**. No buttons to press while it loads.\n- Pick the stadium **by its photo**: the stadiums are now a row of pictures, and the **▶ Post match** button is right on the photo you choose.\n- Stadium names are the same as in the game (for example **Plaça de Catalunya**).\n\n### Play with the keyboard\n- New **Controls** page in the launcher: turn on **Play with keyboard** and pick a layout made for FIFA Street:\n  - **Keyboard + mouse** (recommended): WASD to move, the mouse for skill moves, left click pass, right click shoot.\n  - **Keyboard only**: WASD to move, J/K/L/I to pass and shoot, arrows for skill moves.\n- Change any key: click it and press the new one. Shift, Ctrl and Alt work as keys too (sprint on Shift while you move).\n- A controller still works at the same time.\n\n### New folder layout\n- Like the FIFA games on PC: **`Game`** now holds the game files and **`Binaries`** holds the game program, its files and **Logs**.\n- Your folder is moved to the new layout automatically when you update. Nothing is copied, and your saves, settings and online name are kept.\n- Logs for support are now in **`Binaries\\Logs`**.\n\n### Fixes\n- **\"Your Gamer Profile does not have the correct permissions\"** when a friend joined your lobby or after a match: fixed on the servers. A failed join no longer drops the player.\n- **Pink / magenta crowds** when two copies of the game ran on the same PC.\n- **Stutter in the first matches of every session:** new shaders are now saved, so they are not prepared again each time you play.\n- **FPS counter:** it now also shows the slowest moment (**\"70 FPS - LOW 22\"**), so the number matches what you see.\n- **Antivirus warnings in the installer** about `TracyClient.dll`: the file is gone (the game never used it).\n- The update window now has the same look as the launcher, and finds your ReStreet folder in more places.\n\n## How to install\n\n- **On v1.5.1 or newer:** open the launcher and press **Update now**.\n- **On v1.3, v1.4 or v1.5:** close the launcher and the game, run **ReStreet-1.5.5-Online-Beta.exe**, pick your ReStreet folder, your online name and your server.\n\nYour saves, settings and online name are kept.\n\n## Known issues (it's a beta!)\n\n- No Rematch option at the end of a match yet.\n- Videos (Street Network uploads) are turned off for now.\n- Division and Cup matches are found with the in-game search, not with launcher matches.\n- Do not leave your player idle in a match: the game removes inactive players.\n\nFound a bug? Open a ticket on Discord and attach the files from `Binaries\\Logs`.\n\n## Remove\n\nRun the patch again and choose **Remove the online patch**. Your offline game goes back to v1.3 (in the new folder layout).\n\n---\n\n*Thanks to **Emran_Ahm3d** for the Discord Rich Presence integration and the folder layout idea.*\n*Country leaderboard: IP to country data by [DB-IP.com](https://db-ip.com) (CC BY 4.0).*\n*ReStreet is a fan project. You need your own copy of FIFA Street (2012). Not affiliated with EA.*\n",
  "html_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/tag/v1.5.5-online-beta",
  "assets": [
   {
    "name": "ReStreet-1.5.5-Online-Beta.exe",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v1.5.5-online-beta/ReStreet-1.5.5-Online-Beta.exe"
   },
   {
    "name": "ReStreet-1.5.5-Online-Beta.exe.sha256",
    "browser_download_url": "https://github.com/samuelit0davila/fifa-street-pc-port/releases/download/v1.5.5-online-beta/ReStreet-1.5.5-Online-Beta.exe.sha256"
   }
  ]
 }
];
