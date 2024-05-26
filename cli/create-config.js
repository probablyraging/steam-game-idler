import fs from 'fs/promises';

export default async function createConfig(configPath) {
    const config = {
        firstStart: true,
        username: null,
        password: null,
        onlineState: null,
        gameIds: '',
        defaultMode: null,
        port: null,
        hasBuiltWS: false,
        rememberLoginDetails: false,
        showGamesAs: null
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 4));
}