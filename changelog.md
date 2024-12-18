[![Downloads](https://img.shields.io/github/downloads/probablyraging/steam-game-idler/1.5.29/total?style=for-the-badge&logo=github&color=137eb5)](https://github.com/probablyraging/steam-game-idler/releases/download/1.5.29/Steam.Game.Idler_1.5.29_x64_en-US.msi)

## Changelog
- Added an `auto idle games` feature.
  - This works similar to the `card farming` and `achievement unlocker` lists
  - Add a max of 32 games to the `auto idle` list by clicking the 3 vertical dots on a game's card
  - View games in the `auto idle` list by choosing it from the drop down `filter` menu
  - When SGI launches, all games in this list will be automatically idled
    - (#35, #48) by @Nevenit, @TiimmyTuurner
- Added a `steamParental/steamMachineAuth` input field to `settings > card farming`
  - **This field is optional** and is **only required if** a `steamParental` and/or `steamMachineAuth` cookie is present when following [these steps](https://github.com/probablyraging/steam-game-idler/wiki/Settings#steam-credentials)
    - (#49) by @FireLostBoy-Tech
