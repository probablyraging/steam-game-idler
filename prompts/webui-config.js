import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import startWebServer from '../cli/start-web-server.js';

// Prompt user for Web UI port
export default function promptUserForPort(config) {
    // If a port already exists we can skip this
    if (config.port) {
        startWebServer(config.port);
        return;
    }

    // Check for existing config file
    const configFile = process.cwd() + '/config.json';

    const q = [{
        type: 'input',
        name: 'port',
        message: `Choose a port for the Web UI to run on ${chalk.gray('(default 3000)')}:`
    }];

    inquirer.prompt(q).then(a => {
        // Set user's preferred port
        const port = parseInt(a.port) || 3000;

        fs.readFile(configFile, (e, data) => {
            const config = JSON.parse(data);
            config.port = port; // default to 3000 if no input
            const updatedConfig = JSON.stringify(config, null, 2);
            fs.writeFileSync(configFile, updatedConfig);
        });

        startWebServer(port);
    });
}