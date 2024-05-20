<div align="center">
  <img src="https://github.com/ProbablyRaging/steam-game-idler/blob/main/assets/logo.png" width='80' alt='Click for larger image' />
  <h1 align="center">Idler CSharp</h1>
  <p align="center">The workhorse behind SGI that handling game idling. A C# executable for interacting with Steamworks.NET and Valve’s Steamworks API.</p>
<p align="center">
  <img src="https://img.shields.io/github/downloads/probablyraging/steam-game-idler/total?style=for-the-badge&logo=github&color=137eb5" alt="Downloads" />
  <img src="https://img.shields.io/github/issues/probablyraging/steam-game-idler?style=for-the-badge&logo=github&color=137eb5" alt="Issues" />
  <img src="https://img.shields.io/github/issues-pr/probablyraging/steam-game-idler?style=for-the-badge&logo=github&color=137eb5" alt="Issues" />
  <img src="https://img.shields.io/github/contributors/probablyraging/steam-game-idler?style=for-the-badge&logo=github&color=137eb5" alt="GitHub Contributors" />
</p>
</div>

# Download
The idler executable is included in the `/libs` directory of your SGI installation. Since it's already bundled with SGI and has limited standalone use, I won't be providing a separate release. However, the source code is available for those interested in exploring or building it from scratch.

# Build It Yourself
1. **Clone**: `git clone -b idler-csharp https://github.com/ProbablyRaging/steam-game-idler.git`
2. **Build**: `msbuild ./idler.csproj`
3. **Check console output** for build dir *(usually `/bin/dist`)*

# License
Licensed under the **[GPL-3.0 License](./LICENSE)**