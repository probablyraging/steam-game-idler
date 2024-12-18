import moment from "moment";
import { invoke } from '@tauri-apps/api/tauri';
import { getVersion } from '@tauri-apps/api/app';
import { Time } from "@internationalized/date";
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';
import axios from 'axios';

let idleCounter = 0;
let achievementCounter = 0;
let antiAwayInterval = null;

export async function startIdler(appId, appName, quiet = false) {
    try {
        const settings = JSON.parse(localStorage.getItem('settings')) || {};
        const stealthIdle = settings?.general?.stealthIdle;
        const steamRunning = await invoke('check_status');
        if (steamRunning) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'libs\\SteamUtility.exe');
            await invoke('start_idle', { filePath: fullPath, appId: appId.toString(), quiet: stealthIdle ? stealthIdle.toString() : quiet.toString() });
            idleCounter++;
            updateMongoStats('idle');
            logEvent(`[Idle] Started ${appName} (${appId})`);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error in startIdler util', error);
        logEvent(`[Error] in (startIdler) util: ${error}`);
    }
};

export async function stopIdler(appId, appName) {
    try {
        await invoke('stop_idle', { appId: appId.toString() });
        logEvent(`[Idling] Stopped ${appName} (${appId})`);
    } catch (error) {
        console.error('Error in stopIdler util: ', error);
        logEvent(`[Error] in (stopIdler) util: ${error}`);
    }
};

export async function toggleAchievement(appId, achievementId) {
    try {
        const steamRunning = await invoke('check_status');
        if (steamRunning) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'libs\\SteamUtility.exe');
            await invoke('toggle_achievement', {
                filePath: fullPath,
                appId: appId.toString(),
                achievementId: achievementId
            });
            achievementCounter++;
            updateMongoStats('achievement');
            logEvent(`[Achievement Unlocker] Unlocked/locked ${achievementId} (${appId})`);
            return true;
        } else {
            logEvent(`[Error] [Achievement Unlocker] Steam is not running`);
            return { error: 'Steam is not running' };
        }
    } catch (error) {
        console.error('Error in toggleAchievement util: ', error);
        logEvent(`[Error] in (toggleAchievement) util: ${error}`);
        return { error: error };
    }
}

export async function unlockAchievement(appId, achievementId) {
    try {
        const steamRunning = await invoke('check_status');
        if (steamRunning) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'libs\\SteamUtility.exe');
            await invoke('unlock_achievement', {
                filePath: fullPath,
                appId: appId.toString(),
                achievementId: achievementId
            });
            achievementCounter++;
            updateMongoStats('achievement');
            logEvent(`[Achievement Unlocker] Unlocked ${achievementId} (${appId})`);
        } else {
            logEvent(`[Error] [Achievement Unlocker] Steam is not running`);
        }
    } catch (error) {
        console.error('Error in unlockAchievement util: ', error);
        logEvent(`[Error] in (unlockAchievement) util: ${error}`);
    }
}

export async function lockAchievement(appId, achievementId) {
    try {
        const steamRunning = await invoke('check_status');
        if (steamRunning) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'libs\\SteamUtility.exe');
            await invoke('lock_achievement', {
                filePath: fullPath,
                appId: appId.toString(),
                achievementId: achievementId
            });
            logEvent(`[Achievement Unlocker] Locked ${achievementId} (${appId})`);
        } else {
            logEvent(`[Error] [Achievement Unlocker] Steam is not running`);
        }
    } catch (error) {
        console.error('Error in lockAchievement util: ', error);
        logEvent(`[Error] in (lockAchievement) util: ${error}`);
    }
}

export async function updateStat(appId, statName, newValue) {
    try {
        const steamRunning = await invoke('check_status');
        if (steamRunning) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'libs\\SteamUtility.exe');
            await invoke('update_stat', {
                filePath: fullPath,
                appId: appId.toString(),
                statName: statName,
                newValue: newValue
            });
            logEvent(`[Achievement Unlocker] Statistic updated ${statName} (${appId}) with value ${newValue}`);
            return true;
        } else {
            logEvent(`[Error] [Achievement Unlocker] Steam is not running`);
            return { error: 'Steam is not running' };
        }
    } catch (error) {
        console.error('Error in updateStat util: ', error);
        logEvent(`[Error] in (updateStat) util: ${error}`);
        return { error: error };
    }
}

export async function checkDrops(steamId, appId, sid, sls) {
    try {
        const res = await invoke('get_drops_remaining', { sid: sid, sls: sls, steamId: steamId, appId: appId.toString() });
        if (res && res.remaining) {
            return res.remaining;
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error in checkDrops util: ', error);
        logEvent(`[Error] in (checkDrops) util: ${error}`);
    }
}

export async function getAllGamesWithDrops(steamId, sid, sls) {
    try {
        const res = await invoke('get_games_with_drops', { sid: sid, sls: sls, steamId: steamId });
        if (res.gamesWithDrops && res.gamesWithDrops.length > 0) {
            return res.gamesWithDrops;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error in getAllGamesWithDrops util: ', error);
        logEvent(`[Error] in (getAllGamesWithDrops) util: ${error}`);
    }
}

export async function logEvent(message) {
    try {
        const version = await getVersion();
        await invoke('log_event', { message: `[v${version}] ${message}` });
    } catch (error) {
        console.error('Error in logEvent util: ', error);
    }
};

export const updateMongoStats = debounce(async (stat) => {
    try {
        console.log(process.env.NEXT_PUBLIC_API_KEY);
        if (stat === 'launched') {
            await axios.post(
                process.env.NEXT_PUBLIC_API_BASE + 'statistics',
                { type: 'launched' },
                { headers: { 'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY, }, }
            );
        } else if (stat === 'idle') {
            await axios.post(
                process.env.NEXT_PUBLIC_API_BASE + 'statistics',
                { type: 'idle' },
                { headers: { 'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY, }, }
            );
            idleCounter = 0;
        } else if (stat === 'achievement') {
            await axios.post(
                process.env.NEXT_PUBLIC_API_BASE + 'statistics',
                { type: 'achievement' },
                { headers: { 'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY, }, }
            );
            achievementCounter = 0;
        }
    } catch (error) {
        console.error('Error in updateMongoStats util: ', error);
        logEvent(`[Error] in (updateMongoStats) util: ${error}`);
    }
}, 5000);

export function isWithinSchedule(scheduleFrom, scheduleTo) {
    const now = new Date();
    const currentTime = new Time(now.getHours(), now.getMinutes());
    const scheduleFromTime = new Time(scheduleFrom.hour, scheduleFrom.minute);
    const scheduleToTime = new Time(scheduleTo.hour, scheduleTo.minute);
    if (scheduleToTime.compare(scheduleFromTime) < 0) {
        return currentTime.compare(scheduleFromTime) >= 0 || currentTime.compare(scheduleToTime) < 0;
    } else {
        return currentTime.compare(scheduleFromTime) >= 0 && currentTime.compare(scheduleToTime) < 0;
    }
}

export async function fetchLatest() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/probablyraging/steam-game-idler/main/latest.json');
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error in (fetchLatest):', error);
        logEvent(`[Error] in (fetchLatest): ${error}`);
        return null;
    }
};

export async function fetchFreeGames() {
    try {
        const res = await invoke('get_free_games');
        if (res) {
            return res;
        }
        return [];
    } catch (error) {
        console.error('Error in (fetchFreeGames):', error);
        logEvent(`[Error] in (fetchFreeGames): ${error}`);
        return false;
    }
}

export async function antiAwayStatus(active = null) {
    try {
        const steamRunning = await invoke('check_status');
        if (!steamRunning) return;
        const settings = JSON.parse(localStorage.getItem('settings')) || {};
        const { antiAway } = settings?.general || {};
        const shouldRun = active !== null ? active : antiAway;
        if (shouldRun) {
            await invoke('anti_away');
            if (!antiAwayInterval) {
                antiAwayInterval = setInterval(async () => {
                    await invoke('anti_away');
                }, 60000 * 3);
            }
        } else {
            if (antiAwayInterval) {
                clearInterval(antiAwayInterval);
                antiAwayInterval = null;
            }
        }
    } catch (error) {
        console.error('Error in (antiAwayStatus):', error);
        logEvent(`[Error] in (antiAwayStatus): ${error}`);
    }
}

export async function sendNativeNotification(title, body) {
    try {
        let permissionGranted = await isPermissionGranted();

        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
        }

        if (permissionGranted) {
            sendNotification({
                title: title,
                body: body,
            });
        }
    } catch (error) {
        console.error('Error in (sendNativeNotification):', error);
        logEvent(`[Error] in (sendNativeNotification): ${error}`);
    }
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function minutesToHoursCompact(number) {
    const durationInMinutes = number;
    const duration = moment.duration(durationInMinutes, 'minutes');
    const hours = Math.floor(duration.asHours());
    return hours;
}

export function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function getRandomDelay(min, max) {
    return Math.floor(Math.random() * ((max - min) * 60 * 1000 + 1)) + min * 60 * 1000;
};