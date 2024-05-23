import fs from 'fs';

export default async function createConfig(configPath) {
    const config = {
        firstStart: true,
        username: null,
        password: null,
        onlineState: null,
        gameIds: "",
        defaultMode: null,
        port: null,
        hasBuiltWS: false,
        rememberLoginDetails: false,
        showGamesAs: null
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}