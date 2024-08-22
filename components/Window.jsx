import React, { useEffect, useState } from 'react';
import { checkUpdate } from '@tauri-apps/api/updater';
import Dashboard from './Dashboard';
import UpdateScreen from './UpdateScreen';
import { logEvent, updateLaunchedStats } from '@/utils/utils';
import { invoke } from '@tauri-apps/api/tauri';
import Setup from './Setup';

export default function Window() {
    const [hasUpdate, setHasUpdate] = useState(false);
    const [userSummary, setUserSummary] = useState(null);

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const { shouldUpdate } = await checkUpdate();
                if (shouldUpdate) {
                    setHasUpdate(true);
                }
            } catch (error) {
                console.error('Failed to check for updates:', error);
            }
        };
        checkForUpdates();
    }, []);

    useEffect(() => {
        const checkSteamStatus = async () => {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'libs\\SteamUtility.exe');
            const result = await invoke('check_steam_status', { filePath: fullPath });
            if (result === 'not_running') {
                setUserSummary(null);
            }
        };
        checkSteamStatus();
    }, []);

    useEffect(() => {
        const defaultSettings = { achievementUnlocker: { random: true, interval: 60 } };
        updateLaunchedStats('launched');
        const userSummaryData = localStorage.getItem('userSummary');
        setUserSummary(JSON.parse(userSummaryData));
        let currentSettings = JSON.parse(localStorage.getItem('settings'));
        if (!currentSettings) {
            localStorage.setItem('settings', JSON.stringify(defaultSettings));
            currentSettings = JSON.parse(localStorage.getItem('settings'));
        }
        logEvent('[System] Launched Steam Game Idler');
    }, []);

    if (hasUpdate) return (
        <UpdateScreen />
    );

    if (!userSummary) return (
        <Setup setUserSummary={setUserSummary} />
    );

    return (
        <div className='bg-base min-h-screen max-h-[calc(100vh-62px)] rounded-tr-lg rounded-tl-lg'>
            <Dashboard userSummary={userSummary} setUserSummary={setUserSummary} />
        </div>
    );
}