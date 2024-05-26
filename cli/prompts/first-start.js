import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { firstStartQ, webUIQ } from './prompt-list.js';
import { sleep, updateConfig } from '../utils.js';
import loginToSteam from '../login-to-steam.js';
import startWebServer from '../../web_server/start-web-server.js';

export default async function firstStartPrompt(configPath) {
    const splash = await fs.readFile(path.join(process.cwd(), '/splash.txt'), 'utf8');

    console.log('\x1Bc');
    console.log(chalk.cyan(splash));
    console.log('\n\nWelcome to Steam Game Idler (SGI) CLI + Web UI');
    console.log('As this is your first time running SGI we need to configure a few settings');
    console.log(`All of these settings will be saved to ${chalk.cyan(configPath)}, you can edit this file at any time\n\n`);

    await sleep(1000);

    const firstStartA = await inquirer.prompt(firstStartQ);

    if (firstStartA.defaultMode) {
        await updateConfig({ defaultMode: firstStartA.mode });
    }

    if (firstStartA.mode === 'webui') {
        const webUIA = await inquirer.prompt(webUIQ);
        await updateConfig(webUIA);
        await updateConfig({ firstStart: false });

        startWebServer(configPath);
        return;
    }

    if (firstStartA.mode === 'cli') {
        loginToSteam(configPath);
    }
}