import React, { useEffect, useState } from 'react';
import { checkUpdate } from '@tauri-apps/api/updater';
import Dashboard from './Dashboard';
import { fetchLatest, logEvent, updateMongoStats } from '@/utils/utils';
import { Time } from '@internationalized/date';
import Setup from './Setup';
import UpdateModal from './UpdateModal';
import UpdateScreen from './UpdateScreen';

export default function Window() {
    const [userSummary, setUserSummary] = useState(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateManifest, setUpdateManifest] = useState(null);
    const [initUpdate, setInitUpdate] = useState(false);

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const { shouldUpdate, manifest } = await checkUpdate();
                const latest = await fetchLatest();
                if (shouldUpdate) {
                    if (latest?.major) {
                        return setInitUpdate(true);
                    }
                    setUpdateManifest(manifest);
                    setUpdateAvailable(true);
                }
            } catch (error) {
                console.error('Error in (checkForUpdates):', error);
                logEvent(`[Error] in (checkForUpdates): ${error}`);
            }
        };
        checkForUpdates();
    }, []);

    useEffect(() => {
        const defaultSettings = {
            general: {
                stealthIdle: false,
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

    if (initUpdate) return (
        <UpdateScreen updateManifest={updateManifest} />
    );

    if (!userSummary) return (
        <Setup setUserSummary={setUserSummary} />
    );

    return (
        <React.Fragment>
            <div className='bg-base min-h-screen max-h-[calc(100vh-62px)] rounded-tr-[10px] rounded-tl-xl'>
                <Dashboard userSummary={userSummary} setUserSummary={setUserSummary} setInitUpdate={setInitUpdate} setUpdateManifest={setUpdateManifest} />
            </div>
            <UpdateModal updateAvailable={updateAvailable} updateManifest={updateManifest} setInitUpdate={setInitUpdate} />
        </React.Fragment>
    );
}