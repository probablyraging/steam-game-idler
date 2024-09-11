import React, { useCallback, useEffect, useState } from 'react';
import { checkUpdate } from '@tauri-apps/api/updater';
import Dashboard from './Dashboard';
import { fetchFreeGames, fetchLatest, logEvent, updateMongoStats } from '@/utils/utils';
import { Time } from '@internationalized/date';
import Setup from './Setup';
import UpdateToast from './UpdateToast';
import UpdateScreen from './UpdateScreen';
import { toast } from 'react-toastify';
import FreeGamesToast from './FreeGamesToast';
import moment from 'moment';

export default function Window() {
    const [userSummary, setUserSummary] = useState(null);
    const [updateManifest, setUpdateManifest] = useState(null);
    const [initUpdate, setInitUpdate] = useState(false);

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const { shouldUpdate, manifest } = await checkUpdate();
                const latest = await fetchLatest();
                if (shouldUpdate) {
                    setUpdateManifest(manifest);
                    if (latest?.major) {
                        return setInitUpdate(true);
                    }
                    toast.info(<UpdateToast updateManifest={manifest} setInitUpdate={setInitUpdate} />, { autoClose: false });
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
                antiAway: true,
                freeGames: false,
                clearData: true,
                minimizeToTray: true,
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
        try {
            updateMongoStats('launched');
            const userSummaryData = localStorage.getItem('userSummary');
            setUserSummary(JSON.parse(userSummaryData));
            let currentSettings = JSON.parse(localStorage.getItem('settings'));
            if (!currentSettings) {
                localStorage.setItem('settings', JSON.stringify(defaultSettings));
                currentSettings = JSON.parse(localStorage.getItem('settings'));
            }
        } catch (error) {
            console.error('Error creating default settings:', error);
            logEvent(`[Error] creating default settings: ${error}`);
        }
    }, []);

    const checkForFreeGames = useCallback(async () => {
        try {
            const settings = JSON.parse(localStorage.getItem('settings')) || {};
            const { freeGames } = settings?.general || {};
            const currentTime = moment().unix();
            const showNotificationAgainAt = Number(localStorage.getItem('freeGamesNotificationCooldown') || 0);
            if (freeGames) {
                const freeGamesAvailable = await fetchFreeGames();
                if (freeGamesAvailable && currentTime > showNotificationAgainAt) {
                    toast.info(<FreeGamesToast />, { autoClose: false });
                    localStorage.setItem('freeGamesNotificationCooldown', moment().add(24, 'hours').unix().toString());
                }
            }
        } catch (error) {
            console.error('Error in (checkForFreeGames):', error);
            logEvent(`[Error] in (checkForFreeGames): ${error}`);
        }
    }, []);

    useEffect(() => {
        const intervalId = setInterval(checkForFreeGames, 60000 * 60);
        checkForFreeGames();
        return () => clearInterval(intervalId);
    }, [checkForFreeGames]);

    if (initUpdate) return (
        <UpdateScreen updateManifest={updateManifest} />
    );

    if (!userSummary) return (
        <Setup setUserSummary={setUserSummary} />
    );

    return (
        <React.Fragment>
            <div className='bg-base min-h-screen max-h-[calc(100vh-62px)]'>
                <Dashboard userSummary={userSummary} setUserSummary={setUserSummary} setInitUpdate={setInitUpdate} setUpdateManifest={setUpdateManifest} />
            </div>
        </React.Fragment>
    );
}