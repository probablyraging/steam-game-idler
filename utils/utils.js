import moment from "moment";
import { invoke } from '@tauri-apps/api/tauri';

let idleCounter = 0;
let achievementCounter = 0;

export function minutesToHoursCompact(number) {
    const durationInMinutes = number;
    const duration = moment.duration(durationInMinutes, 'minutes');
    const hours = Math.floor(duration.asHours());
    return hours;
}

export async function startIdler(appId, appName, quiet = false) {
    try {
        const steamRunning = await invoke('check_status');
        if (steamRunning) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'libs\\SteamUtility.exe');
            await invoke('start_idle', { filePath: fullPath, appId: appId.toString(), quiet: quiet.toString() });
            idleCounter++;
            updateIdleStats();
            logEvent(`[Idle] Started ${appName}`);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error in startIdler util', error);
    }
};

export async function stopIdler(appId, appName) {
    try {
        await invoke('stop_idle', { appId: appId.toString() });
        logEvent(`[Idling] Stopped ${appName}`);
    } catch (error) {
        console.error('Error in stopIdler util: ', error);
    }
};

export async function unlockAchievement(appId, achievementId, unlockAll) {
    try {
        const steamRunning = await invoke('check_status');
        if (steamRunning) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'libs\\SteamUtility.exe');
            await invoke('unlock_achievement', {
                filePath: fullPath,
                appId: appId.toString(),
                achievementId: achievementId,
                unlockAll: unlockAll
            });
            achievementCounter++;
            updateAchievementStats();
            logEvent(`[Achievement Unlocker] Unlocked/locked ${achievementId} (${appId})`);
            return true;
        } else {
            logEvent(`[Error] [Achievement Unlocker] Steam is not running`);
            return { error: 'Steam is not running' };
        }
    } catch (error) {
        console.error('Error in unlockAchievement util: ', error);
        return { error: error };
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
            achievementCounter++;
            updateAchievementStats();
            logEvent(`[Achievement Unlocker] Locked ${achievementId} (${appId})`);
        } else {
            logEvent(`[Error] [Achievement Unlocker] Steam is not running`);
        }
    } catch (error) {
        console.error('Error in lockAchievement util: ', error);
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
        return { error: error };
    }
}

export async function checkDrops(steamId, appId, sid, sls) {
    try {
        const response = await fetch('https://apibase.vercel.app/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'drops', steamId: steamId, appId: appId, sid: sid, sls: sls }),
        })
        if (response.status !== 500) {
            const data = await response.json();
            if (data.remaining) {
                return data.remaining;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error in checkDrops util: ', error);
    }
}

export async function getAllGamesWithDrops(steamId, sid, sls) {
    try {
        const response = await fetch('https://apibase.vercel.app/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'games-with-drops', steamId: steamId, sid: sid, sls: sls }),
        });
        if (response.status !== 500 || response.status !== 504) {
            const data = await response.json();
            return data.games;
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error in getAllGamesWithDrops util: ', error);
    }
}

export async function logEvent(message) {
    try {
        await invoke('log_event', { message });
    } catch (error) {
        console.error('Error in logEvent util: ', error);
    }
};

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const updateIdleStats = debounce(async (num) => {
    try {
        await fetch('https://apibase.vercel.app/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'statistics', type: 'idle', count: idleCounter > 0 ? idleCounter : num }),
        });
        idleCounter = 0;
    } catch (error) {
        console.error('Error in updateIdleStats util: ', error);
    }
}, 5000);

const updateAchievementStats = debounce(async () => {
    try {
        await fetch('https://apibase.vercel.app/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'statistics', type: 'achievement', count: achievementCounter }),
        });
        achievementCounter = 0;
    } catch (error) {
        console.error('Error in updateAchievementStats util: ', error);
    }
}, 5000);

export async function updateLaunchedStats(type) {
    try {
        fetch('https://apibase.vercel.app/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'statistics', type: type, count: 1 }),
        });
    } catch (error) {
        console.error('Error in updateLaunchedStats util: ', error);
    }
}

function debounce(func, wait) {
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