import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';

// Run user through config
export default async function promptUserToCompleteConfig(username, password) {
    // Check for existing config file
    const configFile = process.cwd() + '/config.json';
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    // If the user has already completed the config for
    // the account they are attempting to log in to
    if (username === config.username && password === config.password && config.configCompleted) return;

    const q = [{
        type: 'confirm',
        name: 'remember',
        message: 'Do you want Steam Idler to remember your login details?'
    },
    {
        type: 'list',
        name: 'onlineState',
        message: 'How do you want to appear in your friends list?',
        choices: [
            { name: 'Online', value: 'online' },
            { name: 'Away', value: 'away' },
            { name: 'Offline', value: 'offline' }
        ]
    }];

    console.log('\x1Bc');
    console.log(chalk.bold(`Before we get started, let's configure some settings..`));

    await inquirer.prompt(q).then(a => {
        fs.readFile(configFile, (e, data) => {
            const config = JSON.parse(data);
            config.username = a.remember ? username : null;
            config.password = a.remember ? password : null;
            config.onlineState = a.onlineState;
            config.username = a.remember ? username : null;
            config.configCompleted = true;
            const updatedConfig = JSON.stringify(config, null, 2);
            fs.writeFileSync(configFile, updatedConfig);
        });
    });
}