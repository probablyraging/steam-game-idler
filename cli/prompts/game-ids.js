import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { gameIdsQ } from './prompt-list.js';
import startIdlingGames from './start-idling.js';

export default async function gameIdsPrompt(client, manualStop, configPath) {
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    const gameIdsConf = config.gameIds;

    if (!manualStop && config.gameIds?.length > 0) {
        await useConfigFileGameIds(client, configPath, config, gameIdsConf);
    } else {
        await promptUserForInput(client, configPath, config);
    }
}

async function useConfigFileGameIds(client, configPath, config, gameIdsConf) {
    const splash = await fs.readFile(path.join(process.cwd(), '/splash.txt'), 'utf8');
    const gameIds = gameIdsConf.split(',').map(id => Number(id.trim()));

    console.log('\x1Bc');
    console.log(chalk.cyan(splash));

    if (gameIds.length > 32) {
        return `\n\nYou can only idle a max of ${chalk.cyan('32')} games at once. You provided ${chalk.cyan(gameIds.length)}`;
    }

    if (gameIds.includes(NaN)) {
        const invalidIndex = gameIds.findIndex(id => isNaN(id));
        const invalidId = gameIds.split(',')[invalidIndex];
        return `\n\nInvalid Game ID(s) provided. Game IDs must be numbers only -> ${chalk.red(invalidId)}`;
    }

    startIdlingGames(client, configPath, config, gameIds, true);
}

async function promptUserForInput(client, configPath, config) {
    const splash = await fs.readFile(path.join(process.cwd(), '/splash.txt'), 'utf8');
    const accountName = client?._loginSession?._accountName || null;
    const onlineState = config.onlineState.charAt(0).toUpperCase() + config.onlineState.slice(1);

    console.log('\x1Bc');
    console.log(chalk.cyan(splash));
    console.log(chalk.green(`\n\nLogged in as ${chalk.cyan(accountName)} appearing ${chalk.cyan(onlineState)}`));
    console.log(`\n\nEnter a game ID to begin idling. Idle multiple games with a comma seperated list of IDs ${chalk.gray('(e.g. 460, 22100, 4766) (max 32)')}`);
    console.log(`You can skip this step by adding a list of game IDs to the config.json - ${chalk.gray('"gameIds": "460, 22100, 4766"')}`);

    const gameIdsA = await inquirer.prompt(gameIdsQ);
    const gameIds = gameIdsA.gameIds.split(',').map(id => Number(id.trim()));

    startIdlingGames(client, configPath, config, gameIds, false);
}