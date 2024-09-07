import {
    getRandomDelay,
    isWithinSchedule,
    startIdler,
    stopIdler,
    unlockAchievement,
    formatTime,
    logEvent,
} from "../utils";
import { invoke } from "@tauri-apps/api/tauri";

export async function fetchAchievements(gameData, settings, setCurrentGame, setHasPrivateGames, setAchievementCount, setGamesWithAchievements) {
    const game = JSON.parse(gameData);
    const userSummary = JSON.parse(localStorage.getItem('userSummary')) || {};

    try {
        setCurrentGame({ appId: game.appid, name: game.name });

        const res = await invoke('get_achievement_unlocker_data', { steamId: userSummary.steamId, appId: game.appid.toString() });

        const userAchievements = res?.userAchievements?.playerstats;
        const gameAchievements = res?.percentages?.achievementpercentages?.achievements;
        const gameSchema = res?.schema?.game;

        if (!userAchievements) {
            setHasPrivateGames(true);
            return { achievements: [], game };
        }

        if (!gameAchievements || !gameSchema) {
            return { achievements: [], game };
        }

        const achievements = userAchievements.achievements
            .filter(achievement => {
                const schemaAchievement = gameSchema.availableGameStats.achievements.find(
                    a => a.name === achievement.apiname
                );
                if (settings.achievementUnlocker.hidden) {
                    return !achievement.achieved && schemaAchievement.hidden === 0;
                } else {
                    return !achievement.achieved;
                }
            })
            .map(achievement => {
                const percentageData = gameAchievements.find(a => a.name === achievement.apiname);
                return {
                    appId: game.appid,
                    name: achievement.apiname,
                    gameName: userAchievements.gameName,
                    percentage: percentageData ? percentageData.percent : null
                };
            })
            .sort((a, b) => b.percentage - a.percentage);

        setAchievementCount(achievements.length);
        setGamesWithAchievements(achievements.length);

        return { achievements, game };
    } catch (error) {
        console.error('Error in (fetchAchievements):', error);
        logEvent(`[Error] in (fetchAchievements) ${error}`);
    }
};

export async function unlockAchievements(achievements, settings, game, setAchievementCount, setCountdownTimer, setIsWaitingForSchedule, isMountedRef, abortControllerRef) {
    try {
        const { interval, idle, schedule, scheduleFrom, scheduleTo } = settings.achievementUnlocker;

        let isGameIdling = false;

        if (idle && (schedule && isWithinSchedule(scheduleFrom, scheduleTo))) {
            await startIdler(achievements[0].appId, achievements[0].gameName, false);
            isGameIdling = true;
        }

        let achievementsRemaining = achievements?.length;

        for (const achievement of achievements) {
            if (isMountedRef.current) {
                if (schedule && !isWithinSchedule(scheduleFrom, scheduleTo)) {
                    if (game) {
                        await stopIdler(game.appid, game.name);
                        isGameIdling = false;
                    }
                    await waitUntilInSchedule(scheduleFrom, scheduleTo, setIsWaitingForSchedule, isMountedRef);
                } else {
                    if (!isGameIdling && idle) {
                        await startIdler(achievements[0].appId, achievements[0].gameName, false);
                        isGameIdling = true;
                    }
                }
                unlockAchievement(achievement.appId, achievement.name, true);
                achievementsRemaining--;
                logEvent(`[Achievement Unlocker - Auto] Unlocked ${achievement.name} for ${achievement.gameName}`);
                setAchievementCount(prevCount => Math.max(prevCount - 1, 0));
                if (achievementsRemaining === 0) {
                    await stopIdler(game.appid, game.name);
                    removeGameFromUnlockerList(game.appid);
                    break;
                }
                const randomDelay = getRandomDelay(interval[0], interval[1]);
                startCountdown(randomDelay / 60000, setCountdownTimer);
                await delay(randomDelay, isMountedRef, abortControllerRef);
            }
        }
    } catch (error) {
        console.error('Error in (unlockAchievements):', error);
        logEvent(`[Error] in (unlockAchievements) ${error}`);
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
                    reject(new DOMException('Achievement unlocking stopped early', 'Stop'));
                } else if (elapsedTime >= ms) {
                    clearInterval(intervalId);
                    resolve();
                }
                elapsedTime += checkInterval;
            }, checkInterval);

            abortControllerRef.current.signal.addEventListener('abort', () => {
                clearInterval(intervalId);
                reject(new DOMException('Achievement unlocking stopped early', 'Stop'));
            });
        });
    } catch (error) {
        console.error('Error in (delay):', error);
        logEvent(`[Error] in (delay) ${error}`);
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

export function removeGameFromUnlockerList(gameId) {
    try {
        const achievementUnlocker = JSON.parse(localStorage.getItem('achievementUnlocker')) || [];
        const updatedAchievementUnlocker = achievementUnlocker.filter(arr => JSON.parse(arr).appid !== gameId);
        localStorage.setItem('achievementUnlocker', JSON.stringify(updatedAchievementUnlocker));
    } catch (error) {
        console.error('Error in (removeGameFromUnlockerList):', error);
        logEvent(`[Error] in (removeGameFromUnlockerList) ${error}`);
    }
};

async function waitUntilInSchedule(scheduleFrom, scheduleTo, setIsWaitingForSchedule, isMountedRef) {
    try {
        setIsWaitingForSchedule(true);
        while (!isWithinSchedule(scheduleFrom, scheduleTo)) {
            if (!isMountedRef.current) {
                setIsWaitingForSchedule(false);
                throw new DOMException('Achievement unlocking stopped due to being outside of the scheduled time', 'Stop');
            }
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
        setIsWaitingForSchedule(false);
    } catch (error) {
        console.error('Error in (waitUntilInSchedule):', error);
        logEvent(`[Error] in (waitUntilInSchedule) ${error}`);
    }
};