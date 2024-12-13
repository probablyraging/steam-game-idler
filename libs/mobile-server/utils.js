const { exec } = require('child_process');
const os = require('os');

const networkInterfaces = os.networkInterfaces();

function getLocalIP() {
    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    console.error('No suitable IPv4 network interface found');
    return null;
}

async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        console.log(data);
        return data.ip;
    } catch (error) {
        console.error('Error fetching public IP:', error);
        return null;
    }
}

function getRandomPort() {
    const minPort = 49152;
    const maxPort = 65535;
    return Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
}

function isProcessRunning(gameId) {
    return new Promise((resolve, reject) => {
        exec(`tasklist /FI "IMAGENAME eq ${gameId}.exe" /FO LIST /V`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            const isRunning = stdout.includes(gameId);
            console.log(gameId, isRunning);
            resolve(isRunning);
        });
    });
}

module.exports = {
    getLocalIP,
    getPublicIP,
    getRandomPort,
    isProcessRunning
}