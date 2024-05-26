import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs/promises';
import path from 'path';
import createConfig from './cli/create-config.js';
import firstStartPrompt from './cli/prompts/first-start.js';
import preStartCheck from './cli/prompts/pre-start-check.js';
import checkForUpdates from './cli/check-for-updates.js';

const configPath = path.join(process.cwd(), '/config.json');
let config;

await checkForUpdates();

try {
    await fs.access(configPath);
    config = JSON.parse(await fs.readFile(configPath, 'utf8'));
} catch (e) {
    if (e.code === 'ENOENT') {
        await createConfig(configPath);
        config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    } else {
        throw e;
    }
}

if (config.firstStart) {
    firstStartPrompt(configPath);
} else {
    preStartCheck(configPath);
}