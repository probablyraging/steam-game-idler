import React, { useCallback, useEffect, useState } from 'react';
import { checkUpdate } from '@tauri-apps/api/updater';
import Dashboard from './Dashboard';
import { fetchFreeGames, fetchLatest, logEvent, sendNativeNotification, updateMongoStats } from '@/utils/utils';
import { Time } from '@internationalized/date';
import Setup from './Setup';
import UpdateToast from './UpdateToast';
import UpdateScreen from './UpdateScreen';
import { toast } from 'react-toastify';

export default function Window() {
    const [userSummary, setUserSummary] = useState(null);
    const [updateManifest, setUpdateManifest] = useState(null);
    const [initUpdate, setInitUpdate] = useState(false);
    const [showFreeGamesTab, setShowFreeGamesTab] = useState(false);
    const [freeGamesList, setFreeGamesList] = useState([]);

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
                antiAway: false,
                clearData: true,
                minimizeToTray: true,
                freeGameNotifications: true,
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
            const lastNotifiedTimestamp = localStorage.getItem('lastNotifiedTimestamp');
            const settings = JSON.parse(localStorage.getItem('settings')) || {};
            const { freeGameNotifications } = settings?.general || {};
            const freeGamesList = await fetchFreeGames();

            const inOneDay = new Date();
            inOneDay.setHours(inOneDay.getHours() + 24);

            if (freeGamesList.games.length > 0) {
                setFreeGamesList(freeGamesList.games);
                setShowFreeGamesTab(true);

                if (freeGameNotifications && (!lastNotifiedTimestamp || Date.now() > parseInt(lastNotifiedTimestamp))) {
                    sendNativeNotification('Free Games Available!', 'Check the sidebar for the 🎁 icon to get your free games');
                    localStorage.setItem('lastNotifiedTimestamp', inOneDay.valueOf());
                }
            } else {
                setFreeGamesList([]);
                setShowFreeGamesTab(false);
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
                <Dashboard
                    userSummary={userSummary}
                    setUserSummary={setUserSummary}
                    setInitUpdate={setInitUpdate}
                    setUpdateManifest={setUpdateManifest}
                    showFreeGamesTab={showFreeGamesTab}
                    freeGamesList={freeGamesList}
                />
            </div>
        </React.Fragment>
    );
}