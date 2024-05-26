import chalk from 'chalk';
import fs from 'fs/promises';
import moment from 'moment';

export default async function logGameNameOrId(client, appid, event) {
    const configFile = process.cwd() + '/config.json';
    const config = JSON.parse(await fs.readFile(configFile, 'utf8'));
    const currentTime = moment().format('HH:mma DD/MM/YYYY');

    if (config.showGamesAs === 'appIds') {
        if (event === 'appLaunched') console.log(chalk.gray(currentTime) + chalk.green(' - Started idling ') + chalk.cyan(appid));
        if (event === 'appQuit') console.log(chalk.gray(currentTime) + chalk.hex('#f79748')(' - Stopped idling ') + chalk.cyan(appid));
    } else {
        client.getProductInfo([appid], [appid], false, (err, app) => {
            if (!err) {
                const missingToken = app[appid]?.missingToken;
                let gameName = app[appid]?.appinfo?.common?.name;
                const currentTime = moment().format('HH:mmA DD/MM/YYYY');

                if (missingToken || !gameName) gameName = appid;

                if (event === 'appLaunched') console.log(chalk.gray(currentTime) + chalk.green(' - Started idling ') + chalk.cyan(gameName));
                if (event === 'appQuit') console.log(chalk.gray(currentTime) + chalk.hex('#f79748')(' - Stopped idling ') + chalk.cyan(gameName));
            } else {
                if (event === 'appLaunched') console.log(chalk.gray(currentTime) + chalk.green(' - Started idling ') + chalk.cyan(appid));
                if (event === 'appQuit') console.log(chalk.gray(currentTime) + chalk.hex('#f79748')(' - Stopped idling ') + chalk.cyan(appid));
            }
        });
    }
}