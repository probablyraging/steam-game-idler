import inquirer from "inquirer";
import chalk from "chalk";
import fs from 'fs';
import promptUserToStopOrContinue from './stop-or-continue.js'

// Prompt user for a list of game IDs to idle
export default async function promptUserForGameIds(client) {
    const configFile = process.cwd() + '/config.json';
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    if (config.gameIds) {
        await useConfigFileGameIds(client, config.gameIds);
    } else {
        await promptUserForGameIdsInput(client);
    }
}

async function useConfigFileGameIds(client, gameIdsConf) {
    console.log(chalk.hex('#7be89a')(`\n\nFound gameIds in your config.json. SGI will now start idling these games`));

    if (gameIdsConf.length === 0) {
        console.log(chalk.yellow(`No valid Game ID(s) provided`));
        return process.exit();
    }

    const gameIdsString = gameIdsConf;

    // Convert user input to an array of numbers
    const gameIds = gameIdsString.split(",").map(id => Number(id.trim()));

    // Max 32 games at once
    if (gameIds.length > 32) {
        console.log(chalk.yellow(`You can only idle a max of ${chalk.blue('32')} games at once. You provided ${chalk.red(gameIds.length)}`));
        return process.exit();
    }

    // Make sure all IDs in the array are valid
    if (gameIds.includes(NaN)) {
        const invalidIndex = gameIds.findIndex(id => isNaN(id));
        const invalidId = gameIdsString.split(",")[invalidIndex];
        console.log(chalk.yellow(`Invalid Game ID(s) provided. Game IDs must be numbers only -> ${chalk.red(invalidId)}`));
        process.exit();
    } else {
        if (!process.env.dev) client.gamesPlayed(gameIds, true);
        promptUserToStopOrContinue(client);
    }
}

async function promptUserForGameIdsInput(client) {
    const q = [{
        type: 'input',
        name: 'gameIds',
        message: `Game ID(s):`
    }];

    console.log(chalk.bold(`\n\nEnter a game ID to begin idling. Idle multiple games with a comma seperated list of IDs ${chalk.gray('(e.g. 460, 22100, 4766) (max 32)')}`));
    console.log(chalk.bold(`You can skip this step by adding a list of game IDs to the config.json - ${chalk.gray('"gameIds": "460, 22100, 4766"')}`));

    inquirer.prompt(q).then(a => {
        if (a.gameIds.length === 0) {
            console.log(chalk.yellow(`No valid Game ID(s) provided`));
            return promptUserForGameIds(client);
        }

        const gameIdsString = a.gameIds;

        // Convert user input to an array of numbers
        const gameIds = gameIdsString.split(",").map(id => Number(id.trim()));

        // Max 32 games at once
        if (gameIds.length > 32) {
            console.log(chalk.yellow(`You can only idle a max of ${chalk.blue('32')} games at once. You provided ${chalk.red(gameIds.length)}`));
            return promptUserForGameIds(client);
        }

        // Make sure all IDs in the array are valid
        if (gameIds.includes(NaN)) {
            const invalidIndex = gameIds.findIndex(id => isNaN(id));
            const invalidId = gameIdsString.split(",")[invalidIndex];
            console.log(chalk.yellow(`Invalid Game ID(s) provided. Game IDs must be numbers only -> ${chalk.red(invalidId)}`));
            promptUserForGameIds(client);
        } else {
            if (!process.env.dev) client.gamesPlayed(gameIds, true);
            promptUserToStopOrContinue(client);
        }
    });
}