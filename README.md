<div align="center">
  <img src="./assets/logo.png" width='80' alt='Click for larger image' />
  <h1 align="center">Steam Game Idler</h1>
  <p align="center">Idle any game in your Steam library. All you need is your Steam username or ID64. No password, token, or any other login information needed.</p>
<p align="center">
  <img src="https://img.shields.io/github/downloads/probablyraging/steam-game-idler/total?style=for-the-badge&logo=github&color=137eb5" alt="Downloads" />
  <img src="https://img.shields.io/github/issues/probablyraging/steam-game-idler?style=for-the-badge&logo=github&color=137eb5" alt="Issues" />
  <img src="https://img.shields.io/github/issues-pr/probablyraging/steam-game-idler?style=for-the-badge&logo=github&color=137eb5" alt="Issues" />
  <img src="https://img.shields.io/github/contributors/probablyraging/steam-game-idler?style=for-the-badge&logo=github&color=137eb5" alt="GitHub Contributors" />
</p>
</div>
<div align="center" style="margin-top: 10px;">
  <img src="./assets/example.png" width='700' alt='Click for larger image' />
</div>

# Download
All the latest versions of SGI can be downloaded from the [releases page](https://github.com/ProbablyRaging/steam-game-idler/releases)

SGI comes bundled as both a portable `.exe`[¹](https://github.com/ProbablyRaging/steam-game-idler#notes) and an installable `.msi` for your choosing. While the portable version should work on most systems running the latest version of Win10 or Win11, the installer version comes bundled with all dependencies and should work on all versions of Windows making it the recommended method. Check the [notes](https://github.com/ProbablyRaging/steam-game-idler#notes) for more details.

SGI also comes in a `lite` version which doesn't require entering a Steam username or ID64 and relies soley on entering a game ID to work.

> [!Note]
> **PORTABLE VERSION** *[WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/?form=MA13LH#download-section) required. On Windows 10 (Version 1803 and later with all updates applied) and Windows 11, the WebView2 runtime is distributed as part of the operating system. Use the MSI installer if you're unsure, as it comes bundled with all dependencies.*

# Build It Yourself
1. Clone the repoistory
```
git clone https://github.com/ProbablyRaging/steam-game-idler.git
```

2. Install dependencies
```
cd ./steam-game-idler
npm install
```

3. Build the idler

*This will create a `/libs` directory containing some packaged libraries in `/src-tauri`*
```
cd ./idler-csharp
msbuild ./idler.csproj
```

4. Build the app
```
cd ./steam-game-idler
npm run tauri build
```
5. Check the console output for build directory *(usually `/src-tauri/target/release/bundle`)* 

# Usage
1. Enter your Steam username or [SteamID64](https://steamid.io/)
2. Make sure Steam is running
3. Click one or more games that you want to idle
4. That's it, it's that simple

# License
All versions of SGI are licensed under the **[GPL-3.0 License](./LICENSE)**