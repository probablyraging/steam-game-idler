import fs from 'fs';

export default async function createEmptyConfig() {
    const config = {
        username: null,
        password: null,
        onlineState: null,
        runAs: null,
        port: null,
        hasBuiltWS: null,
        configCompleted: null
    };

    const configFile = process.cwd() + '/config.json';
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}