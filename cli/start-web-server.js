import { exec } from 'child_process';
import { wsStartIdling, wsStopIdling } from '../web_server/idling.js';
import chalk from 'chalk';
import fs from 'fs';

export default async function startWebServer(port) {
    const configFile = process.cwd() + '/config.json';
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    // Start web server
    let webServer;
    if (!config.hasBuiltWS) {
        webServer = exec(`npm run build -- --port=${port}`, {
            cwd: './src',
        });
        printCentered(chalk.bold(`--> ${chalk.yellow(`Building web server..`)} \n\nThis is the first time launching the web server, this will take a minute or two \nFuture launches will be instant`));
    } else if (process.argv.includes('--rebuild')) {
        webServer = exec(`npm run build -- --port=${port}`, {
            cwd: './src',
        });
        printCentered(chalk.bold(`--> ${chalk.yellow(`Rebuilding web server..`)} \n\nProcess ran with the ${chalk.gray('--rebuild')} flag, this will take a minute or two`));
    } else {
        webServer = exec(`npm run start -- --port=${port}`, {
            cwd: './src',
        });
        printCentered(chalk.bold(`--> ${chalk.yellow(`Starting web server..`)}`));
    }

    webServer.stdout.on('data', (stdout) => {
        if (stdout.includes('Ready')) {
            if (!config.hasBuiltWS) {
                fs.readFile(configFile, (e, data) => {
                    const config = JSON.parse(data);
                    config.hasBuiltWS = true;
                    const updatedConfig = JSON.stringify(config, null, 2);
                    fs.writeFileSync(configFile, updatedConfig);
                });
            }

            console.log('\x1Bc');
            printCentered(chalk.bold(`--> Web Server running at ${chalk.blue(`http://localhost:${port}/`)} ${chalk.yellow('\n\nLeave this terminal open!')}`));
        }

        if (stdout.includes('serverMessage')) {
            const { serverMessage, gameIds, steamAuth } = JSON.parse(stdout);

            if (serverMessage === 'start-idle') {
                wsStartIdling(steamAuth.username, steamAuth.password, gameIds);
            }
            if (serverMessage === 'stop-idle') {
                wsStopIdling(steamAuth.username, steamAuth.password, gameIds);
            }
        }
    });

    webServer.stderr.on('data', (stderr) => {
        // Ignore errors about nextjs images
        if (data.includes('upstream')) return;
        console.error(`stderr: ${stderr}`);
    });

    webServer.on('error', (error) => {
        console.error(`error: ${error.message}`);
    });

    webServer.on('exit', (code, signal) => {
        console.log('Web server exited');
    });

    process.on('SIGINT', () => {
        webServer.kill('SIGINT');
        process.exit();
    });

    process.on('SIGTERM', () => {
        webServer.kill('SIGTERM');
        process.exit();
    });
}

function printCentered(message) {
    const termHeight = process.stdout.rows;
    const messageLines = message.split('\n');
    const messageLength = messageLines.length;
    const padding = Math.floor((termHeight - messageLength) / 2);
    console.log('\x1Bc');
    for (let i = 0; i < padding; i++) {
        console.log('');
    }
    for (let i = 0; i < messageLines.length; i++) {
        console.log(messageLines[i]);
    }
    for (let i = 0; i < padding; i++) {
        console.log('');
    }
}