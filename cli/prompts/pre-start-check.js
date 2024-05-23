import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from "chalk";
import loginToSteam from '../login-to-steam.js';
import { sleep, updateConfig } from '../utils.js';
import { firstStartQ, webUIQ } from './prompt-list.js';
import startWebServer from '../../web_server/start-web-server.js';

export default async function preStartCheck(configPath) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const defaultMode = config.defaultMode;
    const splash = fs.readFileSync(path.join(process.cwd(), '/splash.txt'), 'utf8');

    console.log('\x1Bc');
    console.log(chalk.cyan(splash));

    if (defaultMode) {
        console.log(`\n\nWelcome to Steam Game Idler (SGI) CLI + Web UI`);
        console.log(`Starting in ${chalk.cyan(defaultMode.toUpperCase())} mode - you can change this in the config\n\n`);
    } else {
        console.log(`\n\nWelcome to Steam Game Idler (SGI) CLI + Web UI\n\n`);
    }

    await sleep(3000);

    if (defaultMode === 'webui') {
        if (!config.port) {
            const webUIA = await inquirer.prompt(webUIQ);
            await updateConfig(webUIA);
        }

        startWebServer(configPath);
        return;
    }

    if (defaultMode === 'cli') {
        loginToSteam(configPath);
        return;
    }

    const firstStartA = await inquirer.prompt(firstStartQ);

    if (firstStartA.defaultMode) {
        await updateConfig({ defaultMode: firstStartA.mode });
    }

    if (firstStartA.mode === 'webui') {
        if (!config.port) {
            const webUIA = await inquirer.prompt(webUIQ);
            await updateConfig(webUIA);
        }

        startWebServer(configPath);
        return;
    }

    if (firstStartA.mode === 'cli') {
        loginToSteam(configPath);
    }
}