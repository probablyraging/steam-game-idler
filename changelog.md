[![Downloads](https://img.shields.io/github/downloads/probablyraging/steam-game-idler/1.5.14/total?style=for-the-badge&logo=github&color=137eb5)](https://github.com/probablyraging/steam-game-idler/releases/download/1.5.14/Steam.Game.Idler_1.5.14_x64_en-US.msi)

## Changelog
- Added a `get notified about free games` option to `settings > general`
  - When active, SGI will check if there are any Steam games with a discount of `100%` _(making them free)_
  - This will not notify you about free to play games, but rather paid games that are on sale for free
  - SGI will check for free games when it launches, and will only check once every 6 hours. If one or more free games are found, you will see a notification in the bottom-right corner
- Fixed an issue where the `between the hours of` setting was reversed
  - Now, the `achievement unlocker` task will only run within the time frame you have chosen, and not the other way around
- Fixed an issue where sorting the games list by `recently played` would default to showing the entire list in no particular order
  - (#27) by @AskaLangly
