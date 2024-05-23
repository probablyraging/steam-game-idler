import inquirer from "inquirer";
import chalk from "chalk";
import fs from 'fs';
import path from 'path';
import { stopOrExitQ } from "./prompt-list.js";
import gameIdsPrompt from "./game-ids.js";
import { sleep } from "../utils.js";

export default async function startIdlingGames(client, configPath, config, gameIds, fromConfig) {
    const splash = fs.readFileSync(path.join(process.cwd(), '/splash.txt'), 'utf8');
    const accountName = client?._loginSession?._accountName || null;
    const onlineState = config.onlineState.charAt(0).toUpperCase() + config.onlineState.slice(1);

    console.log('\x1Bc');
    console.log(chalk.cyan(splash));
    console.log(chalk.green(`\n\nLogged in as ${chalk.cyan(accountName)} appearing ${chalk.cyan(onlineState)}\n\n`));

    if (fromConfig) {
        console.log('Found a list of game IDs set in the config file, SGI will now start idling these games\n\n');
    }

    if (!process.env.dev) {
        client.gamesPlayed(gameIds, true);
    }

    await sleep(3000);

    console.log(`\n\nType ${chalk.cyan('stop')} to finish idling current games and return to menu`);
    console.log(`Type ${chalk.cyan('exit')} to finish idling current games and exit Steam Game Idler`);

    const stopOrExitA = await inquirer.prompt(stopOrExitQ);

    if (stopOrExitA.stopOrExit === 'stop') {
        if (process.env.dev) {
            console.log(`Stopped idling`);
            return;
        }

        console.log('\n');

        client.gamesPlayed([], true);

        await sleep(3000);

        gameIdsPrompt(client, true, configPath);
        return;
    }

    if (stopOrExitA.stopOrExit === 'exit') {
        if (process.env.dev) {
            console.log(`Stopped idling.. Exiting..`);
            return;
        }

        console.log('\n');

        client.gamesPlayed([], true);
        await sleep(3000);

        client.logOff();
        console.log(chalk.yellow(`Exiting..`));
        process.exit();
    }
}