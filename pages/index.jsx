import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SetupModal from '@/components/SetupModal';
import MainPage from '@/components/MainPage';

export default function index() {
    const [userSummary, setUserSummary] = useState(null);

    useEffect(() => {
        const userSummaryData = localStorage.getItem('userSummary');
        setUserSummary(JSON.parse(userSummaryData));
    }, []);

    if (!userSummary) {
        return (
            <Layout>
                <SetupModal setUserSummary={setUserSummary} />
            </Layout>
        )
    }

    return (
        <Layout>
            <MainPage userSummary={userSummary} setUserSummary={setUserSummary} />
        </Layout>
    )
}
