import React, { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { IoIosStats } from 'react-icons/io';
import GridView from './GridView';
import Private from './Private';
import Loader from './Loader';
import { Tooltip } from '@nextui-org/react';
import Achievements from './Achievements';

export default function GamesList({ steamId, sortStyle, inputValue, isQuery }) {
    let [isLoading, setIsLoading] = useState(false);
    let [gameList, setGameList] = useState(null);
    const [favorites, setFavorites] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [appId, setAppId] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        fetch('https://steeeam.vercel.app/api/ext-user-game-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { steamId: steamId } }),
        }).then(async res => {
            if (res.status !== 500) {
                const gameList = await res.json();
                setGameList(gameList);
            }
            setIsLoading(false);
        });
    }, [steamId]);

    useEffect(() => {
        const favorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
        setFavorites(favorites.map(JSON.parse));
    }, []);

    const handleShowStats = () => {
        setShowStats(!showStats);
    };

    if (sortStyle === 'a-z') {
        gameList = gameList?.sort((gameA, gameB) => {
            const nameA = gameA.game.name.toLowerCase();
            const nameB = gameB.game.name.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    } else if (sortStyle === 'z-a') {
        gameList = gameList?.sort((gameA, gameB) => {
            const nameA = gameA.game.name.toLowerCase();
            const nameB = gameB.game.name.toLowerCase();
            return nameB.localeCompare(nameA);
        });
    } else if (sortStyle === '1-0') {
        gameList = gameList?.sort((a, b) => b.minutes - a.minutes);
    } else if (sortStyle === '0-1') {
        gameList = gameList?.sort((a, b) => a.minutes - b.minutes);
    } else if (sortStyle === 'recent') {
        gameList = gameList?.sort((a, b) => b.lastPlayedTimestamp - a.lastPlayedTimestamp);
    } else if (sortStyle === 'fav') {
        const favorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
        gameList = favorites.map(JSON.parse);
    };

    if (isQuery) {
        const filteredGames = gameList.filter(item =>
            item.game.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        gameList = filteredGames;
    };

    if (isLoading) return <Loader />;

    if (!gameList) return <Private steamId={steamId} />;

    return (
        <React.Fragment>
            <div className='w-calc min-h-calc max-h-calc overflow-y-auto'>
                <div className='p-4'>
                    {showAchievements === true ? (
                        <Achievements steamId={steamId} appId={appId} setShowAchievements={setShowAchievements} />
                    ) : (
                        <React.Fragment>
                            <div className='flex justify-end items-center w-full gap-2 pb-4'>
                                <Tooltip closeDelay={0} placement='left' className='text-xs' content='Show game information'>
                                    <Button
                                        isIconOnly
                                        startContent={<IoIosStats fontSize={18} />}
                                        size='sm'
                                        className={`${showStats && 'text-sgi'} bg-container border border-border`}
                                        onClick={() => handleShowStats()}
                                    />
                                </Tooltip>
                            </div>

                            <GridView
                                gameList={gameList}
                                favorites={favorites}
                                setFavorites={setFavorites}
                                showStats={showStats}
                                showAchievements={showAchievements}
                                setShowAchievements={setShowAchievements}
                                setAppId={setAppId}
                            />
                        </React.Fragment>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}