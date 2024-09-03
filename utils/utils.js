import moment from "moment";
import { invoke } from '@tauri-apps/api/tauri';
import { getVersion } from '@tauri-apps/api/app';
import { Time } from "@internationalized/date";

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
        const res = await invoke('get_drops_remaining', { sid: sid, sls: sls, steamId: steamId, appId: appId.toString() });
        if (res && res.remaining) {
            return res.remaining;
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error in checkDrops util: ', error);
    }
}

export async function getAllGamesWithDrops(steamId, sid, sls) {
    try {
        const res = await invoke('get_games_with_drops', { sid: sid, sls: sls, steamId: steamId });
        if (res.gamesWithDrops && res.gamesWithDrops.length > 0) {
            return res.gamesWithDrops;
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error in getAllGamesWithDrops util: ', error);
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

export function isOutsideSchedule(scheduleFrom, scheduleTo) {
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