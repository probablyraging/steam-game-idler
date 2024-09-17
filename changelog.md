[![Downloads](https://img.shields.io/github/downloads/probablyraging/steam-game-idler/1.5.23/total?style=for-the-badge&logo=github&color=137eb5)](https://github.com/probablyraging/steam-game-idler/releases/download/1.5.23/Steam.Game.Idler_1.5.23_x64_en-US.msi)

## Changelog
- Added a `steam web api key` option to `settings > general`
  - Allows users to supply their own Steam web API key for fetching user summary and game data
  - Useful if users want to keep their Steam profile and game details set to private, but still use SGI as normal
    - This works only when using an API key that is attached to the account you are logged in to SGI as
    - Some feature still wont work if your profile or game details are private, such as;
      - Displaying recent games
      - Displaying lock/unlock state of achievements
  - API keys are free for all users with a Steam account, you can [get your API key here](https://steamcommunity.com/dev/apikey)
- Sensitive credentials on the `settings` screen are now treated as passwords, and can be viewed as plain text when adding them, but will be permanently hidden afterwards