import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import createEmptyConfig from './cli/create-empty-config.js';
import startUp from './prompts/startup.js';

// Check if a config file exists, create one if not
const configFile = process.cwd() + '/config.json';

let config;

if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
} else {
    await createEmptyConfig();
    config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
}

startUp(config);