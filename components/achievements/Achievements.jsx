import React, { useEffect, useState } from 'react';
import Loader from '../Loader';
import PageHeader from './PageHeader';
import Alerts from './Alerts';
import BulkButtons from './BulkButtons';
import AchievementsList from './AchievementsList';

export default function Achievements({ steamId, appId, appName, setShowAchievements }) {
    let [isLoading, setIsLoading] = useState(true);
    let [achievementList, setAchievementList] = useState([]);
    let [userAchievements, setUserAchievements] = useState([]);
    let [gameAchievementsPercentages, setGameAchievementsPercentages] = useState([]);
    const [isSorted, setIsSorted] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [achievementsUnavailable, setAchievementsUnavailable] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [showAlertOne, setShowAlertOne] = useState(true);
    const [showAlertTwo, setShowAlertTwo] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetch('https://apibase.vercel.app/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'game-schema', appId: appId }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setAchievementList(data.availableGameStats?.achievements);
                }
            }),
            fetch('https://apibase.vercel.app/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-achievements', steamId: steamId, appId: appId }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setUserAchievements(data.achievements);
                } else {
                    setAchievementsUnavailable(true);
                }
            }),
            fetch('https://apibase.vercel.app/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'game-achievement-percentage', appId: appId }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setGameAchievementsPercentages(data);
                }
            })
        ]).finally(() => setIsLoading(false));
    }, [steamId, appId]);

    useEffect(() => {
        const alertOne = localStorage.getItem('alertOne');
        if (alertOne !== null) setShowAlertOne(alertOne);
        const alertTwo = localStorage.getItem('alertTwo');
        if (alertTwo !== null) setShowAlertTwo(alertTwo);
    }, []);

    const userAchievementsMap = new Map();
    userAchievements.forEach(item => userAchievementsMap.set(item.name, item.unlocked));

    const percentageMap = new Map();
    gameAchievementsPercentages.forEach(item => percentageMap.set(item.name, item.percent));

    if (!isSorted && achievementList && achievementList.length > 0) {
        achievementList = [...achievementList].sort((a, b) => {
            const percentA = percentageMap.get(a.name) || 0;
            const percentB = percentageMap.get(b.name) || 0;
            return percentB - percentA;
        });
    };

    if (inputValue.length > 0) {
        achievementList = achievementList.filter(achievement =>
            achievement.displayName.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    if (isLoading) return <Loader />;

    return (
        <React.Fragment>
            <div className='min-h-calc max-h-calc w-full overflow-y-auto overflow-x-hidden'>
                <div className='p-4'>
                    <PageHeader
                        setShowAchievements={setShowAchievements}
                        achievementList={achievementList}
                        setAchievementList={setAchievementList}
                        setIsSorted={setIsSorted}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        percentageMap={percentageMap}
                        userAchievementsMap={userAchievementsMap}
                    />

                    <Alerts
                        achievementsUnavailable={achievementsUnavailable}
                        showAlertOne={showAlertOne}
                        setShowAlertOne={setShowAlertOne}
                        showAlertTwo={showAlertTwo}
                        setShowAlertTwo={setShowAlertTwo}
                    />

                    <div className='flex flex-wrap gap-4 mt-2'>
                        <BulkButtons
                            appId={appId}
                            appName={appName}
                            achievementsUnavailable={achievementsUnavailable}
                            btnLoading={btnLoading}
                            achievementList={achievementList}
                            inputValue={inputValue}
                            setBtnLoading={setBtnLoading}
                        />

                        <AchievementsList
                            appId={appId}
                            achievementsUnavailable={achievementsUnavailable}
                            achievementList={achievementList}
                            userAchievementsMap={userAchievementsMap}
                            percentageMap={percentageMap}
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}