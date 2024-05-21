import inquirer from "inquirer";
import fs from 'fs';
import chalk from "chalk";
import promptUserForLogin from "./user-login.js";

// Prompt user to delete saved login details (or not)
// and then reprompt them to login again
export default function promptUserToDeleteSavedLoginDetails(config) {
    const q = [{
        type: 'confirm',
        name: 'delete',
        message: `Do you wish to delete the saved login details for ${chalk.blue(config.username)}?`
    }];

    inquirer.prompt(q).then(a => {
        if (a.delete) {
            const configFile = process.cwd() + '/config.json';
            fs.unlink(configFile, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(chalk.bold(`\n\nYour login details have been deleted. Redirecting back to login..`));

                    setTimeout(() => {
                        promptUserForLogin();
                    }, 3000);
                }
            });
        } else {
            promptUserForLogin();
        }
    });
}