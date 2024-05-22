import inquirer from "inquirer";
import chalk from "chalk";
import fs from 'fs';
import startUp from "./startup.js";
import preLoginCheck from "../cli/pre-login-check.js";
import promptUserForPort from "./webui-config.js";

async function timeoutPrompt(defaultAnswer, timeMs, config) {
    return await new Promise(async (resolve) => {
        console.log('\x1Bc');
        console.log(chalk.bold(`Starting SGI in ${chalk.blue(config.runAs)} mode. To change this, type ${chalk.red('edit')} or press ${chalk.red('enter')} to continue ${chalk.gray('(10s)')}`));
        let options = {
            type: 'input',
            name: 'edit',
            message: chalk.blue('>')
        };
        setTimeout(function () {
            resolve(defaultAnswer);
        }, timeMs);
        let answer = await inquirer.prompt([options]);
        resolve(answer);
    });
}

// Give the user 10 seconds to change which mode SGi start in
export default async function preRunCheck(config) {
    let a = await timeoutPrompt('null', 10000, config);
    if (a.edit) {
        // Set runAs to null
        const configFile = process.cwd() + '/config.json';
        fs.readFile(configFile, (e, data) => {
            const config = JSON.parse(data);
            config.runAs = null;
            const updatedConfig = JSON.stringify(config, null, 2);
            fs.writeFileSync(configFile, updatedConfig);
            const newConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            return startUp(newConfig);
        });
    } else {
        if (config.runAs === 'webui') {
            promptUserForPort(config);
        } else {
            preLoginCheck(config);
        }
    }
}