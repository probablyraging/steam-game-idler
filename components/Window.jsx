import React, { useEffect, useState } from 'react';
import Setup from './Setup';
import Dashboard from './Dashboard';
import { logEvent, statistics } from '@/utils/utils';
import UpdateModal from './UpdateModal';
import { getVersion } from '@tauri-apps/api/app';
import semver from 'semver';

export default function Window() {
    const [userSummary, setUserSummary] = useState(null);
    const [hasMajorUpdate, setHasMajorUpdate] = useState(false);

    useEffect(() => {
        fetch('https://apibase.vercel.app/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'check-major-update' }),
        }).then(async (res) => {
            if (res.status !== 500) {
                const data = await res.json();
                const currentVersion = await getVersion();
                const latestVersion = data.version;
                if (data.major && semver.lt(currentVersion, latestVersion)) {
                    setHasMajorUpdate(true);
                }
            }
        });
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

    if (!userSummary) return (
        <React.Fragment>
            <Setup setUserSummary={setUserSummary} />
            {hasMajorUpdate && (
                <UpdateModal />
            )}
        </React.Fragment>
    );

    return (
        <div className='bg-base min-h-screen max-h-[calc(100vh-62px)] rounded-tr-lg rounded-tl-lg'>
            <Dashboard userSummary={userSummary} setUserSummary={setUserSummary} />
            {hasMajorUpdate && (
                <UpdateModal />
            )}
        </div>
    );
}