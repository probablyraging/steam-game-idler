<div align="center">
  <img src="https://github.com/ProbablyRaging/steam-game-idler/blob/main/assets/logo.png" width='80' alt='Click for larger image' />
  <h1 align="center">Idler CSharp</h1>
  <p align="center">This is the workhorse behind SGI that handles game idling. A C# executable for interacting with Steamworks.NET and Valve’s Steamworks API.</p>
<p align="center">
  <img src="https://img.shields.io/github/downloads/probablyraging/steam-game-idler/total?style=for-the-badge&logo=github&color=137eb5" alt="Downloads" />
  <img src="https://img.shields.io/github/issues/probablyraging/steam-game-idler?style=for-the-badge&logo=github&color=137eb5" alt="Issues" />
  <img src="https://img.shields.io/github/issues-pr/probablyraging/steam-game-idler?style=for-the-badge&logo=github&color=137eb5" alt="Issues" />
  <img src="https://img.shields.io/github/contributors/probablyraging/steam-game-idler?style=for-the-badge&logo=github&color=137eb5" alt="GitHub Contributors" />
</p>
</div>

# Download
The idler executable is included with all versions of SGI and can be found in the `/libs` directory of your SGI installation. As it's already bundled with SGI I won't be providing a separate release for the idler since it has limited standalone utility. However, I'm making the source code available for those who are interested, or wanting to build it from scratch.

# Build It Yourself
1. Clone the repository
```
git clone -b idler-csharp https://github.com/ProbablyRaging/steam-game-idler.git
```
1. Build the executable
```
msbuild .\idler.csproj
```
3. Check the console output for build directory *(usually `/bin/dist`)*

# License
Licensed under the **[GPL-3.0 License](./LICENSE)**