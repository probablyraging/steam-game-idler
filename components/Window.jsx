import React, { useEffect, useState } from 'react';
import Setup from './Setup';
import Dashboard from './Dashboard';

export default function Window() {
    const [userSummary, setUserSummary] = useState(null);

    useEffect(() => {
        const userSummaryData = localStorage.getItem('userSummary');
        setUserSummary(JSON.parse(userSummaryData));
    }, []);

    if (!userSummary) return <Setup setUserSummary={setUserSummary} />;

    return (
        <div className='bg-base min-h-screen max-h-[calc(100vh-62px)] rounded-tr-lg rounded-tl-lg'>
            <Dashboard userSummary={userSummary} setUserSummary={setUserSummary} />
        </div>
    );
}