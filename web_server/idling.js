import SteamUser from "steam-user";
import chalk from "chalk";

const client = new SteamUser();
client.setOptions({ autoRelogin: true });

async function wsLogin(username, password,) {
    client.logOn({
        accountName: username,
        password: password
    });

    client.on('loggedOn', () => {
        console.log(chalk.bold.green(`Logged in to Steam account ${chalk.blue(username)}(${chalk.gray(client.steamID)}) appearing as ${chalk.blue('Offline')}`));
        client.setPersona(SteamUser.EPersonaState.Online);
    });

    client.on('appLaunched', (appid) => {
        console.log(chalk.bold.green(`Game with ID ${chalk.blue(appid)} is being idled`));
    });

    client.on('appQuit', (appid) => {
        console.log(chalk.bold.hex('#f79748')(`Game with ID ${chalk.blue(appid)} is no longer being idled`));
    });

    client.on('disconnected', (msg) => {
        console.log(chalk.bold.yellow(`Unexpectedly disconnected from Steam's server: ${msg}`));
        console.log(chalk.bold.yellow(`Attempting to log back in..`));
    });
}

export async function wsStartIdling(username, password, gameIds) {
    if (!client.steamID) {
        await wsLogin(username, password);
        setTimeout(() => {
            client.gamesPlayed(gameIds, true);
        }, 5000);
        return;
    }
    client.gamesPlayed(gameIds, true);
};

export function wsStopIdling(username, password) {
    if (!client.steamID) {
        wsLogin(username, password);
        client.gamesPlayed([], true);
        return;
    }
    client.gamesPlayed([], true);
};