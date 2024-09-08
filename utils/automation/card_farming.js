import { checkDrops, formatTime, getAllGamesWithDrops, logEvent, startIdler, stopIdler } from "../utils";

const farmingInterval = 60000 * 30;
const shortDelay = 15000;
const mediumDelay = 60000;
const longDelay = 60000 * 5;

export async function checkGamesForDrops() {
    const cardFarming = JSON.parse(localStorage.getItem('cardFarming')) || [];
    const steamCookies = JSON.parse(localStorage.getItem('steamCookies')) || {};
    const userSummary = JSON.parse(localStorage.getItem('userSummary')) || {};
    const settings = JSON.parse(localStorage.getItem('settings')) || {};

    const gameDataArr = cardFarming.map(game => JSON.parse(game));
    const gamesSet = new Set();
    let totalDrops = 0;

    try {
        if (settings.cardFarming.allGames) {
            const gamesWithDrops = await getAllGamesWithDrops(userSummary.steamId, steamCookies.sid, steamCookies.sls);
            console.log(gamesWithDrops);
            if (gamesWithDrops) {
                for (const gameData of gamesWithDrops) {
                    if (gamesSet.size < 32) {
                        gamesSet.add({ appId: gameData.id, name: gameData.name });
                        totalDrops += gameData.remaining;
                        logEvent(`[Card Farming] ${gameData.remaining} drops remaining for ${gameData.name} - starting`);
                    } else {
                        break;
                    }
                }
            }
        } else {
            const dropCheckPromises = gameDataArr.map(async (gameData) => {
                if (gamesSet.size >= 32) return Promise.resolve();
                const dropsRemaining = await checkDrops(userSummary.steamId, gameData.appid, steamCookies.sid, steamCookies.sls);
                if (dropsRemaining > 0) {
                    if (gamesSet.size < 32) {
                        gamesSet.add({ appId: gameData.appid, name: gameData.name });
                        totalDrops += dropsRemaining;
                        logEvent(`[Card Farming] ${dropsRemaining} drops remaining for ${gameData.name} - starting`);
                    }
                } else {
                    logEvent(`[Card Farming] ${dropsRemaining} drops remaining for ${gameData.name} - removed from list`);
                    removeGameFromFarmingList(gameData.appid);
                }
            });
            await Promise.all(dropCheckPromises);
        }
    } catch (error) {
        console.error('Error in (checkGamesForDrops) :', error);
        logEvent(`[Error] in (checkGamesForDrops) ${error}`);
    }

    return { totalDrops, gamesSet };
};

export async function farmCards(gamesSet, setCountdownTimer, isMountedRef, abortControllerRef) {
    const farmingPromises = Array.from(gamesSet).map(game => farmGame(game, setCountdownTimer, isMountedRef, abortControllerRef));
    await Promise.all(farmingPromises);
};

async function farmGame(game, setCountdownTimer, isMountedRef, abortControllerRef) {
    try {
        await startAndStopIdler(game.appId, game.name, longDelay, setCountdownTimer, isMountedRef, abortControllerRef);
        startCountdown(mediumDelay / 60000, setCountdownTimer);
        await delay(mediumDelay, isMountedRef, abortControllerRef);
        await startAndStopIdler(game.appId, game.name, shortDelay, setCountdownTimer, isMountedRef, abortControllerRef);
        startCountdown(mediumDelay / 60000, setCountdownTimer);
        await delay(mediumDelay, isMountedRef, abortControllerRef);
        await startAndStopIdler(game.appId, game.name, farmingInterval, setCountdownTimer, isMountedRef, abortControllerRef);
        startCountdown(mediumDelay / 60000, setCountdownTimer);
        await delay(mediumDelay, isMountedRef, abortControllerRef);
        await startAndStopIdler(game.appId, game.name, shortDelay, setCountdownTimer, isMountedRef, abortControllerRef);
    } catch (error) {
        console.error('Error in (farmGame) :', error);
        logEvent(`[Error] in (farmGame) ${error}`);
    }
};

async function startAndStopIdler(appId, name, duration, setCountdownTimer, isMountedRef, abortControllerRef) {
    try {
        startCountdown(duration / 60000, setCountdownTimer);
        startIdler(appId, name, true);
        await delay(duration, isMountedRef, abortControllerRef);
        stopIdler(appId, name);
    } catch (error) {
        console.error('Error in (startAndStopIdler) :', error);
        logEvent(`[Error] in (startAndStopIdler) ${error}`);
    }
};

function startCountdown(durationInMinutes, setCountdownTimer) {
    try {
        const durationInMilliseconds = durationInMinutes * 60000;
        let remainingTime = durationInMilliseconds;

        const intervalId = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(intervalId);
                return;
            }

            setCountdownTimer(formatTime(remainingTime));
            remainingTime -= 1000;
        }, 1000);
    } catch (error) {
        console.error('Error in (startCountdown):', error);
        logEvent(`[Error] in (startCountdown) ${error}`);
    }
};

function removeGameFromFarmingList(gameId) {
    try {
        const cardFarming = JSON.parse(localStorage.getItem('cardFarming')) || [];
        const updatedCardFarming = cardFarming.filter(game => JSON.parse(game).id !== gameId);
        localStorage.setItem('cardFarming', JSON.stringify(updatedCardFarming));
    } catch (error) {
        console.error('Error in (removeGameFromFarmingList) :', error);
        logEvent(`[Error] in (removeGameFromFarmingList) ${error}`);
    }
};

const delay = (ms, isMountedRef, abortControllerRef) => {
    try {
        return new Promise((resolve, reject) => {
            const checkInterval = 1000;
            let elapsedTime = 0;

            const intervalId = setInterval(() => {
                if (!isMountedRef.current) {
                    clearInterval(intervalId);
                    reject(new DOMException('Card farming stopped early', 'Stop'));
                } else if (elapsedTime >= ms) {
                    clearInterval(intervalId);
                    resolve();
                }
                elapsedTime += checkInterval;
            }, checkInterval);

            abortControllerRef.current.signal.addEventListener('abort', () => {
                clearInterval(intervalId);
                reject(new DOMException('Card farming stopped early', 'Stop'));
            });
        });
    } catch (error) {
        console.error('Error in (delay) :', error);
        logEvent(`[Error] in (delay) ${error}`);
    }
};