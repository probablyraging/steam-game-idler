import inquirer from "inquirer";
import fs from 'fs';
import chalk from "chalk";

export default async function setPreferred(method) {
    const configFile = process.cwd() + '/config.json';

    const q = [{
        type: 'confirm',
        name: 'setPreferred',
        message: `Always run SGI in ${chalk.blue(method)} mode?. ${chalk.gray(`You can change this at any time in ${configFile}`)}`,
        choices: [
            { name: 'Web UI', value: 'webui' },
            { name: 'CLI', value: 'cli' },
        ]
    }];

    await inquirer.prompt(q).then(async (a) => {
        if (a.setPreferred) {
            // Set runAs to preferred method
            fs.readFile(configFile, (e, data) => {
                const config = JSON.parse(data);
                config.runAs = method;
                const updatedConfig = JSON.stringify(config, null, 2);
                fs.writeFileSync(configFile, updatedConfig);
            });
        } else {
            // Set run as to null
            fs.readFile(configFile, (e, data) => {
                const config = JSON.parse(data);
                config.runAs = null;
                const updatedConfig = JSON.stringify(config, null, 2);
                fs.writeFileSync(configFile, updatedConfig);
            });
        }
    });
}