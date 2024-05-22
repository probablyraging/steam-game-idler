import inquirer from "inquirer";
import clientLogOn from "../cli/client-login.js";
import promptUserToDeleteSavedLoginDetails from "./delete-login-details.js";
import promptUserForLogin from "./user-login.js";
import chalk from "chalk";

async function timeoutPrompt(defaultAnswer, timeMs, config) {
    return await new Promise(async (resolve) => {
        console.log('\x1Bc');
        let options = {
            type: 'confirm',
            name: 'confirm',
            message: `Login with previously saved account details for ${chalk.blue(config.username)}? ${chalk.gray('(10s)')}`
        };
        setTimeout(function () {
            resolve(defaultAnswer);
        }, timeMs);
        let answer = await inquirer.prompt([options]);
        resolve(answer);
    });
}

// If a config.json containing previous login details exists
// prompt the user if they wish to use them or delete them
export default async function preRunCheck(config) {
    if (!config.username) {
        return promptUserForLogin();
    }

    let a = await timeoutPrompt({ confirm: null }, 10000, config);
    if (a.confirm || a.confirm === null) {
        clientLogOn(config.username, config.password);
    } else {
        promptUserToDeleteSavedLoginDetails(config);
    }
}