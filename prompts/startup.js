import inquirer from "inquirer";
import setPreferred from "./set-preferred.js";
import preLoginCheck from "../cli/pre-login-check.js";
import preRunCheck from "./pre-run-check.js";
import promptUserForPort from "./webui-config.js";

// Determine if we should start SGI as a web ui or CLI
export default async function startUp(config) {
    // Allow the user to change their runAs option or skip
    if (config.runAs) {
        return preRunCheck(config);
    }

    const q = [{
        type: 'list',
        name: 'runAs',
        message: 'Do you want to run SGI as a Web UI or CLI',
        choices: [
            { name: 'Web UI', value: 'webui' },
            { name: 'CLI', value: 'cli' },
        ]
    }];

    console.log('\x1Bc');
    inquirer.prompt(q).then(async (a) => {
        if (a.runAs === 'webui') {
            // Prompt user to see if we should set as preferred method
            await setPreferred(a.runAs);
            // Start web ui prompt flow
            promptUserForPort(config);
        } else {
            await setPreferred(a.runAs);
            preLoginCheck(config);
        }
    });
}