import SteamUser from "steam-user";
import fs from 'fs';
import chalk from "chalk";

export default async function setUserPersona(client, username, steamId) {
    const configFile = process.cwd() + '/config.json';
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    switch (config?.onlineState) {
        case 'online': {
            console.log(chalk.bold.green(`Logged in to Steam account ${chalk.blue(username)}(${chalk.gray(steamId)}) appearing as ${chalk.blue('Online')}`));
            client.setPersona(SteamUser.EPersonaState.Online);
            break;
        }
        case 'away': {
            console.log(chalk.bold.green(`Logged in to Steam account ${chalk.blue(username)}(${chalk.gray(steamId)}) appearing as ${chalk.blue('Away')}`));
            client.setPersona(SteamUser.EPersonaState.Away);
            break;
        }
        case 'offline': {
            console.log(chalk.bold.green(`Logged in to Steam account ${chalk.blue(username)}(${chalk.gray(steamId)}) appearing as ${chalk.blue('Offline')}`));
            client.setPersona(SteamUser.EPersonaState.Offline);
            break;
        }
        default: {
            console.log(chalk.yellow(`Could not find a valid "onlineState" in ${chalk.yellow(configFile)}`));
            console.log(chalk.bold.green(`Logged in to Steam account ${chalk.blue(username)}(${chalk.gray(steamId)}) appearing as ${chalk.blue('Offline')}`));
            client.setPersona(SteamUser.EPersonaState.Offline);
            break;
        }
    }
}