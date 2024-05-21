import chalk from "chalk";
import SteamUser from "steam-user";
import promptUserToCompleteConfig from "../prompts/user-config.js";
import promptUserForGameIds from "../prompts/game-ids.js";
import setUserPersona from "./set-user-persona.js";

export default async function clientLogOn(username, password) {
    const client = new SteamUser();

    if (process.env.dev) {
        await promptUserToCompleteConfig(username, password);
        promptUserForGameIds();
    }

    if (!process.env.dev) {
        // Configure the client
        client.setOptions({ autoRelogin: true });

        // Log in to the client
        client.logOn({
            accountName: username,
            password: password
        });

        client.on('loggedOn', async (e) => {
            // Set user's online state
            await setUserPersona(client, username, client.steamID);
            // Ask user to configure settings
            await promptUserToCompleteConfig(username, password);
            // Ask user which games they'd like to idle
            promptUserForGameIds(client);
        });

        client.on('appLaunched', (appid) => {
            console.log(chalk.bold.green(`Game with ID ` + chalk.blue(appid) + ` is being idled`));
        });

        client.on('appQuit', (appid) => {
            console.log(chalk.bold.hex('#f79748')(`Game with ID ` + chalk.blue(appid) + ` is no longer being idled`));
        });

        client.on('disconnected', (msg) => {
            console.log(chalk.bold.yellow(`Unexpectedly disconnected from Steam's server: `, msg));
            console.log(chalk.bold.yellow(`Attempting to log back in..`));
        });
    }
}