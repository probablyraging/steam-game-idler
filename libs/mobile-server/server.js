const minimist = require('minimist');
const { WebSocketServer } = require('ws');
const { getLocalIP, getRandomPort, isProcessRunning } = require('./utils.js');

const args = minimist(process.argv.slice(2));
const gameIds = new Set();
let gamesList = [];

async function createWebsocketServer() {
    const host = args.local === 'true' ? getLocalIP() : '0.0.0.0';
    const port = args.port && args.port > 1000 ? args.port : getRandomPort();

    if (!host) {
        console.error('Unable to find local IP - websocket is not running');
        return;
    }

    const wss = new WebSocketServer({
        host: host,
        port: port
    });

    wss.on('connection', (ws) => {
        console.log('Client connected');

        ws.on('message', (message) => {
            try {
                const parsedMessage = JSON.parse(message.toString());

                switch (parsedMessage.type) {
                    case 'games_list':
                        const gamesListArr = JSON.parse(parsedMessage.payload);
                        gamesListArr.forEach(game => {
                            gamesList.push(game);
                        });
                        break;

                    case 'get_games_list':
                        ws.send(JSON.stringify({ type: 'games_list', payload: gamesList }));
                        break;

                    case 'start_idle':
                        gameIds.add(parsedMessage.payload);
                        console.log('Running program:', parsedMessage.payload);
                        break;

                    case 'stop_idle':
                        gameIds.delete(parsedMessage.payload);
                        console.log('Exiting program:', parsedMessage.payload);
                        break;
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });

        ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to desktop' }));
    });

    wss.on('listening', () => {
        console.log('Mobile server running at:');
        console.log(`   Host: ${host}`);
        console.log(`   Port: ${port}`);
        console.log('');

        // Check if an idle process was manually stopped
        setInterval(async () => {
            for (const id of gameIds) {
                const isRunning = await isProcessRunning(id);
                if (!isRunning) {
                    gameIds.delete(id);
                }
            }

            wss.clients.forEach((client) => {
                if (client.readyState) {
                    client.send(JSON.stringify({ type: 'gameIds', payload: [...gameIds] }));
                }
            });
        }, 1000);
    });

    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });
}






// const isRunning = await isProcessRunning('notepad');
// console.log(isRunning);

createWebsocketServer();