# Nivalis Nights for Vortex

Vortex game extension for [Nivalis Nights](https://www.nexusmods.com/nivalisnights). It lets Vortex find the Steam install and deploy Nexus mods into the game.

The game is Unity IL2CPP. Almost every mod on Nexus is a BepInEx 6 plugin. This extension places those files where the game loads them.

## Install it for yourself

Vortex 1.9 or newer is required. This was written against Vortex 2.8.

1. Close Vortex.
2. Copy this folder to `%APPDATA%\Vortex\plugins\game-nivalisnights`. The copy must contain `index.js`, `install-patterns.js`, `info.json`, and `gameart.png` directly inside that folder.
3. Start Vortex. Open **Extensions** and confirm **Nivalis Nights** loaded without an error.
4. On the Games page, manage **Nivalis Nights**. Vortex looks up Steam app `1488490`.
5. If BepInEx is not already installed, Vortex links to the [BepInEx IL2CPP pack](https://www.nexusmods.com/nivalisnights/mods/25). Download that pack with Vortex, enable it, and deploy. The first launch after installing BepInEx can sit on a blank window for a few minutes while it generates interop assemblies. Later launches are faster.
6. Download mods from the Nivalis Nights Nexus page with the Vortex button, enable them, and deploy.

Plugins you already copied into `BepInEx\plugins` by hand stay where they are. Vortex may report them as external changes the first time you deploy. Leave those files as external changes unless you want Vortex to take over that copy.

## Where mods go

| Archive layout | Deployed to |
| --- | --- |
| `MyMod.dll` | `BepInEx\plugins\MyMod.dll` |
| `MyMod\MyMod.dll` | `BepInEx\plugins\MyMod\MyMod.dll` |
| `BepInEx\plugins\...` and `BepInEx\config\...` | the same folders under the game directory |
| `plugins\MyMod.dll` | `BepInEx\plugins\MyMod.dll` |
| `BepInEx\patchers\...` | `BepInEx\patchers\...` |
| BepInEx pack (`winhttp.dll`, `BepInEx\core`, `dotnet`) | the game directory |
| `Mods\Something.dll` (MelonLoader) | `Mods\Something.dll` |

A loose `.dll` is treated as a BepInEx plugin. That matches the current Nexus mods, including the BepInEx build of the trainer. Use a `Mods\` folder in the archive for a MelonLoader build.

## Share it

Vortex only lists the extension in its Extensions browser after Nexus Mods reviews it and adds it to the manifest.

1. Package a zip whose **root** contains `info.json`, `index.js`, `install-patterns.js`, and `gameart.png`. Do not wrap those files in an extra folder. From this directory:

   ```powershell
   New-Item -ItemType Directory -Force dist | Out-Null
   Compress-Archive -Path info.json, index.js, install-patterns.js, gameart.png -DestinationPath dist\game-nivalisnights-0.1.0.zip -Force
   ```

2. Upload that zip to Nexus Mods. Category: **Vortex → Extensions**. Keep a single Main File. The file version on Nexus must match `info.json` (`0.1.0` for this release). The game page itself is [Nivalis Nights](https://www.nexusmods.com/nivalisnights); extensions are uploaded on the site, not as a normal game mod.
3. Open a [Review Extension](https://github.com/Nexus-Mods/Vortex/issues/new?template=review-extension.yaml) issue on the Vortex repository. Use your Nexus username, the extension's Nexus URL, and `https://www.nexusmods.com/nivalisnights` as the game URL.
4. Bump the version in `info.json` for every re-upload, and use that same version on Nexus.

Packaging and review rules: [How to package a game extension](https://github.com/Nexus-Mods/Vortex/wiki/How-to-package-a-game-extension) and [How to submit a game extension for review](https://github.com/Nexus-Mods/Vortex/wiki/How-to-submit-a-game-extension-for-review).

`gameart.png` is a 640×360 crop of the Steam library art, without the title lockup Vortex draws itself. Replace it if you have art you would rather use. Keep it a 640×360 PNG under 1 MB.

## Check the installer rules

```powershell
node test/installer.test.js
```

Those tests cover the archive layouts used by the current Nexus mods. They do not launch Vortex.
