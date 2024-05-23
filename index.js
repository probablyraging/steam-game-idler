import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import createConfig from './cli/create-config.js';
import firstStartPrompt from './cli/prompts/first-start.js';
import preStartCheck from './cli/prompts/pre-start-check.js';
import checkForUpdates from './cli/check-for-updates.js'

const configPath = path.join(process.cwd(), '/config.json');
let config;

await checkForUpdates();

if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} else {
    await createConfig(configPath);
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

if (config.firstStart) {
    firstStartPrompt(configPath);
} else {
    preStartCheck(configPath);
}