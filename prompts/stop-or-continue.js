import chalk from "chalk";
import inquirer from "inquirer";
import promptUserForGameIds from "./game-ids.js";

// Once games are idling, allow the user to stop idling
// and return them back to promptUserForGameIds 
export default function promptUserToStopOrContinue(client) {
    const q = [{
        type: 'input',
        name: 'stopIdler',
        message: chalk.blue('>')
    }];

    console.log(chalk.bold(`\n\nType ${chalk.red('stop')} or ${chalk.red('exit')} at any time to stop idling games`));

    inquirer.prompt(q).then(a => {
        if (a.stopIdler === 'stop') {
            if (!process.env.dev) client.gamesPlayed([], true);

            promptUserForGameIds(client);
        } else if (a.stopIdler === 'exit') {
            console.log(chalk.bold.yellow(`Exiting..`));

            if (!process.env.dev) {
                client.gamesPlayed([], true);
                client.logOff();
            }

            process.exit();
        } else {
            console.log(chalk.bold.yellow(`Command "${chalk.grey(a.stopIdler)}" not recognized`));
            promptUserToStopOrContinue(client);
        }
    });
}