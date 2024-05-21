import inquirer from "inquirer";
import clientLogOn from "../cli/client-login.js";
import promptUserToDeleteSavedLoginDetails from "./delete-login-details.js";
import promptUserForLogin from "./user-login.js";
import chalk from "chalk";

// If a config.json containing previous login details exists
// prompt the user if they wish to use them or delete them
export default function confirmLoginWithSavedDetails(config) {
    if (!config.username) {
        return promptUserForLogin();
    }

    const q = [{
        type: 'confirm',
        name: 'confirm',
        message: `Login with previously saved account details for ${chalk.blue(config.username)}?`
    }];

    console.log('\x1Bc');
    inquirer.prompt(q).then(a => {
        if (a.confirm) {
            clientLogOn(config.username, config.password);
        } else {
            promptUserToDeleteSavedLoginDetails(config);
        }
    });

}