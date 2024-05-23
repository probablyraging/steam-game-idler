import { exec } from 'child_process';
import chalk from "chalk";
import fs from 'fs';
import path from 'path';
import { updateConfig } from "../cli/utils.js";
import { wsStartIdling, wsStopIdling } from './handle-idling.js';

export default async function startWebServer(configPath) {
    const splash = fs.readFileSync(path.join(process.cwd(), '/splash.txt'), 'utf8');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const port = config.port || 3000;

    let webServer;
    if (!config.hasBuiltWS || process.argv.includes('--rebuild')) {
        webServer = exec(`npm run build -- --port=${port}`, { cwd: './src' });
        console.log('\x1Bc');
        console.log(chalk.cyan(splash));
        console.log(`\n\n--> Building web server.. ${getBuildMessage(config.hasBuiltWS)}`);
    } else {
        webServer = exec(`npm run start -- --port=${port}`, { cwd: './src' });
        console.log('\x1Bc');
        console.log(chalk.cyan(splash));
        console.log(`\n\n--> Starting web server..`);
    }

    webServer.stdout.on('data', (stdout) => {
        if (stdout.includes('Ready')) {
            if (!config.hasBuiltWS) {
                updateConfig({ hasBuiltWS: true });
            }
            console.log('\x1Bc');
            console.log(chalk.cyan(splash));
            console.log(`\nWeb server: ${chalk.hex('#f79748')(`http://localhost:${port}/`)} ${getRunningMessage()}`);
        }

        if (stdout.includes('serverMessage')) {
            const { serverMessage, gameIds, steamAuth } = JSON.parse(stdout);
            handleServerMessage(serverMessage, steamAuth, gameIds);
        }
    });

    webServer.stderr.on('data', (stderr) => {
        if (stderr.includes('upstream')) return;
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

function getBuildMessage(hasBuiltWS) {
    return hasBuiltWS ?
        `\nSteam Game Idler ran with the ${chalk.gray('--rebuild')} flag, this will take a minute or two` :
        `\nThis is the first time launching the web server, this will take a minute or two. Future launches will be instant`;
}

function getRunningMessage() {
    return `\n\n${chalk.yellow(`Leave this window open!\n`)}`;
}

function handleServerMessage(serverMessage, steamAuth, gameIds) {
    if (serverMessage === 'start-idle') {
        wsStartIdling(steamAuth.username, steamAuth.password, gameIds);
    }
    if (serverMessage === 'stop-idle') {
        wsStopIdling(steamAuth.username, steamAuth.password, gameIds);
    }
}