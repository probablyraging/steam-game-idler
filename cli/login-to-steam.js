import inquirer from "inquirer";
import SteamUser from "steam-user";
import chalk from "chalk";
import fs from 'fs';
import path from 'path';
import { steamLoginMinQ, steamLoginQ } from "./prompts/prompt-list.js";
import { sleep, updateConfig } from "./utils.js";
import gameIdsPrompt from "./prompts/game-ids.js";
import logGameNameOrId from "./log-name-or-id.js";

const OnlineState = {
    Online: 'online',
    Away: 'away',
    Offline: 'offline',
};

export default async function loginToSteam(configPath) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const splash = fs.readFileSync(path.join(process.cwd(), '/splash.txt'), 'utf8');

    let username = config.username;
    let password = config.password;
    let onlineState = config.onlineState;

    if (username && password) {
        console.log(`Logging in to Steam using saved details for ${chalk.cyan(username)}`);
        await sleep(2000);
    }

    if (!username || !password) {
        if (!config.onlineState) {
            const steamLoginA = await inquirer.prompt(steamLoginQ);

            username = steamLoginA.username;
            password = steamLoginA.password;
            onlineState = steamLoginA.onlineState

            if (steamLoginA.rememberLoginDetails) {
                await updateConfig(steamLoginA);
            } else {
                delete steamLoginA.password;
                await updateConfig(steamLoginA);
            }

            await updateConfig({ firstStart: false });

            console.log('\x1Bc');
            console.log(chalk.cyan(splash));
            console.log(`\n\nLogging in to Steam as ${chalk.cyan(username)}`);
        } else {
            const steamLoginMinA = await inquirer.prompt(steamLoginMinQ);

            username = steamLoginMinA.username;
            password = steamLoginMinA.password;

            if (steamLoginMinA.rememberLoginDetails) {
                await updateConfig(steamLoginMinA);
            } else {
                delete steamLoginMinA.password;
                await updateConfig(steamLoginMinA);
            }

            console.log('\x1Bc');
            console.log(chalk.cyan(splash));
            console.log(`\n\nLogging in to Steam as ${chalk.cyan(username)}`);
        }
    }

    if (process.env.dev) {
        gameIdsPrompt(null, false, configPath);
        return;
    }

    const client = new SteamUser();
    client.setOptions({ autoRelogin: true });

    client.logOn({
        accountName: username,
        password: password,
    });

    client.on("loggedOn", async (e) => {
        const personaState = getPersonaState(onlineState);
        client.setPersona(personaState);

        gameIdsPrompt(client, false, configPath);
    });

    client.on('appLaunched', async (appid) => {
        await logGameNameOrId(client, appid, 'appLaunched');
    });

    client.on('appQuit', async (appid) => {
        await logGameNameOrId(client, appid, 'appQuit');
    });

    client.on('disconnected', (msg) => {
        console.log(chalk.red(`Unexpectedly disconnected from Steam's server:`), msg);
        console.log(`Attempting to log back in..`);
    });

    client.on("error", (err) => {
        console.error(chalk.red(`Error logging in to Steam:`), err.message);
    });
}

function getPersonaState(onlineState) {
    switch (onlineState) {
        case OnlineState.Online:
            return SteamUser.EPersonaState.Online;
        case OnlineState.Away:
            return SteamUser.EPersonaState.Away;
        case OnlineState.Offline:
            return SteamUser.EPersonaState.Offline;
        default:
            return SteamUser.EPersonaState.Offline;
    }
}