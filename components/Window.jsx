import React, { useEffect, useState } from 'react';
import { checkUpdate } from '@tauri-apps/api/updater';
import Dashboard from './Dashboard';
import UpdateScreen from './UpdateScreen';
import { logEvent, updateMongoStats } from '@/utils/utils';
import { Time } from '@internationalized/date';
import Setup from './Setup';

export default function Window() {
    const [hasUpdate, setHasUpdate] = useState(false);
    const [userSummary, setUserSummary] = useState(null);
    const [updateManifest, setUpdateManifest] = useState(null);

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const settings = JSON.parse(localStorage.getItem('settings')) || {};
                const { disableUpdates } = settings?.general || {};
                const { shouldUpdate, manifest } = await checkUpdate();
                const latest = await fetchLatest();
                if (disableUpdates && !latest?.major) return;
                if (shouldUpdate) {
                    setUpdateManifest(manifest);
                    setHasUpdate(true);
                }
            } catch (error) {
                console.error('Error in (checkForUpdates):', error);
                logEvent(`[Error] in (checkForUpdates): ${error}`);
            }
        };
        checkForUpdates();
    }, []);

    const fetchLatest = async () => {
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

    useEffect(() => {
        const defaultSettings = {
            general: {
                stealthIdle: false,
                disableUpdates: false,
                clearData: true
            },
            cardFarming: {
                listGames: true,
                allGames: false
            },
            achievementUnlocker: {
                idle: true,
                hidden: false,
                schedule: false,
                scheduleFrom: new Time(8, 30),
                scheduleTo: new Time(23, 0),
                interval: [30, 130],
            }
        };
        updateMongoStats('launched');
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
        <UpdateScreen updateManifest={updateManifest} />
    );

    if (!userSummary) return (
        <Setup setUserSummary={setUserSummary} />
    );

    return (
        <div className='bg-base min-h-screen max-h-[calc(100vh-62px)] rounded-tr-[10px] rounded-tl-xl'>
            <Dashboard userSummary={userSummary} setUserSummary={setUserSummary} setHasUpdate={setHasUpdate} setUpdateManifest={setUpdateManifest} />
        </div>
    );
}