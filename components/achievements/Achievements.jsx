import React, { useEffect, useState } from 'react';
import Loader from '../Loader';
import PageHeader from './PageHeader';
import Alerts from './Alerts';
import BulkButtons from './BulkButtons';
import AchievementsList from './AchievementsList';
import { Tab, Tabs } from '@nextui-org/react';
import StatisticsList from './StatisticsList';

export default function Achievements({ steamId, appId, appName, setShowAchievements }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSorted, setIsSorted] = useState(false);
    const [inputValue, setInputValue] = useState('');
    let [achievementList, setAchievementList] = useState([]);
    const [statisticsList, setStatisticsList] = useState([]);
    const [userGameStats, setUserGameStats] = useState({});
    const [gameAchievementsPercentages, setGameAchievementsPercentages] = useState([]);
    const [achievementsUnavailable, setAchievementsUnavailable] = useState(false);
    const [statisticsUnavailable, setStatisticsUnavailable] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [showAlertOne, setShowAlertOne] = useState(true);
    const [currentTab, setCurrentTab] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetch('http://localhost:3001/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'game-schema', appId: appId }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setAchievementList(data.availableGameStats?.achievements);
                    setStatisticsList(data.availableGameStats?.stats);
                    if (!data.availableGameStats?.achievements) {
                        setAchievementsUnavailable(true);
                    };
                    if (!data.availableGameStats?.stats) {
                        setStatisticsUnavailable(true);
                    };
                }
            }),
            fetch('http://localhost:3001/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-game-stats', steamId: steamId, appId: appId }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setUserGameStats(data.playerstats);
                }
            }),
            fetch('http://localhost:3001/api/route', {
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
    }, []);

    const userGameAchievementsMap = new Map();
    userGameStats?.achievements && userGameStats.achievements.forEach(item => userGameAchievementsMap.set(item.name, item.achieved));

    const userGameStatsMap = new Map();
    userGameStats?.stats && userGameStats.stats.forEach(item => userGameStatsMap.set(item.name, item.value));

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
                        userGameAchievementsMap={userGameAchievementsMap}
                        currentTab={currentTab}
                    />

                    <Alerts
                        achievementsUnavailable={achievementsUnavailable}
                        showAlertOne={showAlertOne}
                        setShowAlertOne={setShowAlertOne}
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
                            currentTab={currentTab}
                        />

                        <div className='flex flex-col w-full'>
                            <Tabs
                                size='sm'
                                aria-label='Settings tabs'
                                color='default'
                                variant='solid'
                                className='max-w-[300px]'
                                classNames={{
                                    base: 'bg-titlebar rounded-t-sm p-0',
                                    tabList: 'gap-0 w-full bg-transparent',
                                    tab: 'px-6 py-3 rounded-none bg-transparent px-4',
                                    tabContent: 'text-xs',
                                    cursor: 'bg-base w-full rounded-sm',
                                    panel: 'bg-titlebar rounded-sm rounded-tl-none',
                                }}
                                onSelectionChange={(e) => setCurrentTab(e)}
                            >
                                <Tab key='achievements' title='Achievements'>
                                    <AchievementsList
                                        appId={appId}
                                        appName={appName}
                                        achievementsUnavailable={achievementsUnavailable}
                                        achievementList={achievementList}
                                        userGameAchievementsMap={userGameAchievementsMap}
                                        percentageMap={percentageMap}
                                    />
                                </Tab>
                                <Tab key='statistics' title='Statistics'>
                                    <StatisticsList
                                        appId={appId}
                                        appName={appName}
                                        statisticsUnavailable={statisticsUnavailable}
                                        statisticsList={statisticsList}
                                        userGameStatsMap={userGameStatsMap}
                                    />
                                </Tab>
                            </Tabs>

                            <p className='text-[10px] text-gray-400 mt-1'>
                                Please note that changes are instant but may take up to 5 minutes to be reflected on this page. Check your game&apos;s achievements page on Steam for real-time changes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}