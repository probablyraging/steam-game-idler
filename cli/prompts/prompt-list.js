import chalk from 'chalk';

export const firstStartQ = [{
    type: 'list',
    name: 'mode',
    message: 'Would you like to run SGI as a CLI or Web UI?',
    choices: [
        { name: 'Web UI', value: 'webui' },
        { name: 'CLI', value: 'cli' },
    ]
}, {
    type: 'confirm',
    name: 'defaultMode',
    message: 'Would you like this to be the default mode when starting SGI?',
}];

export const steamLoginQ = [{
    type: 'input',
    name: 'username',
    message: 'Steam Username:',
    validate(a) { if (a.length === 0) return 'Username required'; return true; }
}, {
    type: 'password',
    name: 'password',
    message: 'Steam Password:',
    validate(a) { if (a.length === 0) return 'Password required'; return true; }
}, {
    type: 'confirm',
    name: 'rememberLoginDetails',
    message: 'Would you like SGI to remember your Steam password?',
}, {
    type: 'list',
    name: 'onlineState',
    message: 'How do you want to appear to your friends on Steam?',
    choices: [
        { name: 'Online', value: 'online' },
        { name: 'Offline', value: 'offline' },
    ]
}, {
    type: 'list',
    name: 'showGamesAs',
    message: `Do you want games to appear as App IDs ${chalk.cyan('(1623730)')} or Game Names ${chalk.cyan('(Palworld)')}? ${chalk.gray('(Using names takes slightly longer due to fetching)')}`,
    choices: [
        { name: 'App IDs', value: 'appIds' },
        { name: 'Game Names', value: 'gameNames' },
    ]
}];

export const steamLoginMinQ = [{
    type: 'input',
    name: 'username',
    message: 'Steam Username:',
    validate(a) { if (a.length === 0) return 'Username required'; return true; }
}, {
    type: 'password',
    name: 'password',
    message: 'Steam Password:',
    validate(a) { if (a.length === 0) return 'Password required'; return true; }
}, {
    type: 'confirm',
    name: 'rememberLoginDetails',
    message: 'Would you like SGI to remember your Steam password?',
}];

export const webUIQ = [{
    type: 'input',
    name: 'port',
    message: `Which port would you like to run on? ${chalk.gray('(e.g. 3000)')}`,
    validate(a) {
        if (isNaN(a) || a.length === 0) return 'Port must be a number';
        return true;
    }
}];

export const gameIdsQ = [{
    type: 'input',
    name: 'gameIds',
    message: 'Game ID(s):',
    validate(a) {
        if (a.length === 0) {
            return 'No valid Game ID(s) provided';
        }

        const gameIds = a.split(',').map(id => Number(id.trim()));

        if (gameIds.length > 32) {
            return `You can only idle a max of ${chalk.cyan('32')} games at once. You provided ${chalk.cyan(gameIds.length)}`;
        }

        if (gameIds.includes(NaN)) {
            const invalidIndex = gameIds.findIndex(id => isNaN(id));
            const invalidId = a.split(',')[invalidIndex];
            return `Invalid Game ID(s) provided. Game IDs must be numbers only -> ${chalk.red(invalidId)}`;
        }

        return true;
    }
}];

export const stopOrExitQ = [{
    type: 'input',
    name: 'stopOrExit',
    message: '\b',
    prefix: chalk.blue('>'),
    validate(a) {
        if (a !== 'stop' && a !== 'exit') return `Command not recognized -> ${chalk.red(a)}`;
        return true;
    }
}];