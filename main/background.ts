import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { exec } from 'child_process'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
    serve({ directory: 'app' })
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
    await app.whenReady()

    const mainWindow = createWindow('main', {
        width: 1120,
        height: 600,
        center: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: true
        },
    })

    // mainWindow.maximize()
    mainWindow.setMenu(null);

    if (isProd) {
        await mainWindow.loadURL('app://./')
        // mainWindow.webContents.openDevTools()
    } else {
        const port = process.argv[2]
        await mainWindow.loadURL(`http://localhost:${port}/`)
        mainWindow.webContents.openDevTools()
    }
})()


app.on('window-all-closed', () => {
    app.quit()
});

ipcMain.on('api/user-summary', async (event, args) => {
    fetch(`https://steeeam.vercel.app/api/user-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer 3VtYpe9FgTzN*q7W@L5Jm2R8XcH!dA6U4sYbEwDfGhKjMnP' },
        body: JSON.stringify({ data: { uid: args.uid } }),
    }).then(async res => {
        if (res.status !== 500) {
            event.reply('user-summary', await res.json());
        } else {
            event.reply('user-summary', { error: 'Error' });
        }
    });
});

ipcMain.on('api/user-game-list', async (event, args) => {
    fetch(`https://steeeam.vercel.app/api/user-game-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer 3VtYpe9FgTzN*q7W@L5Jm2R8XcH!dA6U4sYbEwDfGhKjMnP' },
        body: JSON.stringify({ data: { steamId: args.steamId } }),
    }).then(async res => {
        const gameList = await res.json();
        if (res.status !== 500) {
            event.reply('user-game-list', gameList);
        } else {
            event.reply('user-game-list', { error: 'Games list private' });
        }
    });
});

ipcMain.on('api/status', async (event, args) => {
    exec('tasklist /FI "IMAGENAME eq steam.exe"', (error, stdout, stderr) => {
        if (stdout.toLowerCase().indexOf('steam.exe') !== -1) {
            event.reply('status', true);
        } else {
            event.reply('status', false);
        }
    });
});

ipcMain.on('api/idle', async (event, args) => {
    const { spawn } = require('child_process');
    const child = spawn(path.join(process.cwd(), 'steam', 'steam-idle.exe'), [args.appId]);
    child.on('error', (err) => {
        console.error('Error spawning child process:', err);
    });
});