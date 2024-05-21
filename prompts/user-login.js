import inquirer from "inquirer";
import clientLogOn from "../cli/client-login.js";

// Prompt user to login to Steam
export default function promptUserForLogin() {
    const q = [{
        type: 'input',
        name: 'username',
        message: 'Steam Username:'
    },
    {
        type: 'password',
        name: 'password',
        message: 'Steam Password:'
    }];

    console.log('\x1Bc');
    inquirer.prompt(q).then(a => {
        clientLogOn(a.username, a.password);
    });
}