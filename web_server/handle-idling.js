import SteamUser from 'steam-user';
import chalk from 'chalk';
import logGameNameOrId from '../cli/log-name-or-id.js';

const client = new SteamUser();
client.setOptions({ autoRelogin: true });

async function wsLogin(username, password,) {
    client.logOn({
        accountName: username,
        password: password
    });

    client.on('loggedOn', () => {
        client.setPersona(SteamUser.EPersonaState.Online);
    });

    client.on('appLaunched', async (appid) => {
        await logGameNameOrId(client, appid, 'appLaunched');
    });

    client.on('appQuit', async (appid) => {
        await logGameNameOrId(client, appid, 'appQuit');
    });

    client.on('disconnected', (msg) => {
        console.log(chalk.bold.yellow(`Unexpectedly disconnected from Steam's server: ${msg}`));
        console.log(chalk.bold.yellow('Attempting to log back in..'));
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