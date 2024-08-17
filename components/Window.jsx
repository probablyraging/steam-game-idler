import React, { useEffect, useState } from 'react';
import Setup from './Setup';
import Dashboard from './Dashboard';
import { logEvent, statistics } from '@/utils/utils';

export default function Window() {
    const [userSummary, setUserSummary] = useState(null);

    useEffect(() => {
        const defaultSettings = {
            achievementUnlocker: {
                random: true,
                interval: 60
            }
        };

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

    if (!userSummary) return <Setup setUserSummary={setUserSummary} />;

    return (
        <div className='bg-base min-h-screen max-h-[calc(100vh-62px)] rounded-tr-lg rounded-tl-lg'>
            <Dashboard userSummary={userSummary} setUserSummary={setUserSummary} />
        </div>
    );
}