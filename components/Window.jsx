import React, { useEffect, useState } from 'react';
import { checkUpdate } from '@tauri-apps/api/updater';
import Dashboard from './Dashboard';
import { fetchFreeGames, fetchLatest, logEvent, updateMongoStats } from '@/utils/utils';
import { Time } from '@internationalized/date';
import Setup from './Setup';
import UpdateScreen from './UpdateScreen';
import { toast } from 'react-toastify';
import UpdateToast from './UpdateToast';
import ExtLink from './ExtLink';

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
                    if (latest?.major) {
                        return setInitUpdate(true);
                    }
                    toast.info(
                        <UpdateToast updateManifest={manifest} setInitUpdate={setInitUpdate} />,
                        { autoClose: false }
                    );
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
                freeGames: false,
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

    useEffect(() => {
        const checkForFreeGames = async () => {
            try {
                const settings = JSON.parse(localStorage.getItem('settings')) || {};
                const { freeGames } = settings?.general || {};
                if (freeGames) {
                    const freeGamesAvailable = await fetchFreeGames();
                    if (freeGamesAvailable) {
                        toast.info(
                            <ExtLink href={'https://isthereanydeal.com/deals/#sort:price;filter:N4IgDgTglgxgpiAXKAtlAdk9BXANrgGhBQEMAPJABgDpKBGAXyIBcBPMBRAbToF0iAzgAsA9mAFIuANj4MgA'}>
                                <p>Free Steam games are available</p>
                                <p className='mt-1'>Click here to view</p>
                            </ExtLink>,
                            { autoClose: false }
                        );
                    }
                }
            } catch (error) {
                console.error('Error in (checkForFreeGames):', error);
                logEvent(`[Error] in (checkForFreeGames): ${error}`);
            }
        };
        checkForFreeGames();
    }, []);

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