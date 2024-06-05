import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import chalk from 'chalk';

export default async function checkForUpdates() {
    const packageJsonPath = path.join(process.cwd(), '/package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;

    try {
        const res = await axios.get('https://raw.githubusercontent.com/ProbablyRaging/steam-game-idler/cli-webui/latest.json');
        const { version, notes } = res.data;

        if (version > currentVersion) {
            const splash = await fs.readFile(path.join(process.cwd(), '/splash.txt'), 'utf8');

            console.log('\x1Bc');
            console.log(chalk.cyan(splash));
            console.log('\n\nThere is an update available for Steam Game Idler');
            console.log(`\nCurrent ${chalk.hex('#f79748')(currentVersion)}   >   Latest ${chalk.green(version)}`);
            console.log(chalk.bold('\nChangelog'));

            for (const [index, note] of notes.entries()) {
                if (index === notes.length - 1) {
                    console.log(`- ${note}\n`);
                } else {
                    console.log(`- ${note}`);
                }
            }

            console.log(`When ready, you can update with ${chalk.cyan('git pull && npm install')}. Make sure you delete your config.json after updating`);
            console.log(`Need help updating? Follow these steps ${chalk.gray('https://github.com/probablyraging/steam-game-idler/tree/cli-webui?tab=readme-ov-file#updates')}\n`);
            console.log(chalk.gray('Press enter to continue to Steam Game Idler..'));

            process.stdin.setEncoding('utf8');
            return new Promise((resolve) => {
                process.stdin.on('data', () => {
                    resolve();
                });
            });
        }
    } catch (e) {
        return e;
    }
}