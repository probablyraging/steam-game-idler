import axios from "axios";
import path from 'path';
import fs from 'fs';
import chalk from "chalk";
import inquirer from "inquirer";
import { updateConfirmQ, updateQ } from "./prompts/prompt-list.js";
import { execSync } from "child_process";
import { sleep } from "./utils.js";

export default async function checkForUpdates(configPath) {
    const packageJsonPath = path.join(process.cwd(), '/package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;
    const platform = process.platform;

    try {
        const res = await axios.get('https://raw.githubusercontent.com/ProbablyRaging/steam-game-idler/cli-webui/latest.json');
        const { version, notes } = res.data;

        if (version > currentVersion) {
            const splash = fs.readFileSync(path.join(process.cwd(), '/splash.txt'), 'utf8');

            console.log('\x1Bc');
            console.log(chalk.cyan(splash));
            console.log(`\n\nThere is an update available for Steam Game Idler`);
            console.log(`\nCurrent ${chalk.red(currentVersion)}   >   Latest ${chalk.blue(version)}`);
            console.log(chalk.bold(`\nChangelog`));

            for (const [index, note] of notes.entries()) {
                if (index === notes.length - 1) {
                    console.log(`- ${note}\n`);
                } else {
                    console.log(`- ${note}`);
                }
            }

            const updateA = await inquirer.prompt(updateQ);

            if (updateA.updateAccepted) {
                const updateConfirmA = await inquirer.prompt(updateConfirmQ);
                if (updateConfirmA.updateConfirm) {
                    if (fs.existsSync(configPath)) {
                        fs.unlinkSync(configPath);
                    }

                    return new Promise(async (resolve, reject) => {
                        try {
                            if (platform === 'win32') {
                                execSync(`git pull && npm install`, { cwd: './', stdio: 'ignore' });
                            } else if (platform === 'linux') {
                                execSync(`pkexec git pull && npm install`, { cwd: './', stdio: 'ignore' });
                            } else if (platform === 'darwin') {
                                execSync(`sudo git pull && npm install`, { cwd: './', stdio: 'ignore' });
                            }
                            console.log(chalk.green(`\nUpdated successfully!\n`));
                            await sleep(3000);
                            resolve();
                        } catch (e) {
                            console.log(chalk.red(`\nUnable to update. Make sure you have 'git' installed, or try updating manually with ${chalk.gray('git pull && npm install')}\n`));
                            process.exit();
                        }
                    });
                }
            }
        }
    } catch (e) {
        return;
    }
}