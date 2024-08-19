import React, { useEffect, useState } from 'react';
import { checkUpdate } from '@tauri-apps/api/updater';
import Setup from './Setup';
import Dashboard from './Dashboard';
import UpdateScreen from './UpdateScreen';
import { logEvent, statistics } from '@/utils/utils';

export default function Window() {
    const [userSummary, setUserSummary] = useState(null);
    const [hasUpdate, setHasUpdate] = useState(false);

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
        const defaultSettings = { achievementUnlocker: { random: true, interval: 60 } };
        statistics('launched');
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
        <React.Fragment>
            <Setup setUserSummary={setUserSummary} />
        </React.Fragment>
    );

    return (
        <div className='bg-base min-h-screen max-h-[calc(100vh-62px)] rounded-tr-lg rounded-tl-lg'>
            <Dashboard userSummary={userSummary} setUserSummary={setUserSummary} />
        </div>
    );
}