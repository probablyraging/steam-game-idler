import React, { useState } from 'react';
import Image from 'next/image';
import CardMenu from './CardMenu';
import CardStats from './CardStats';
import Loader from '../Loader';
import { IoPlay } from 'react-icons/io5';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { startIdler, logEvent } from '@/utils/utils';

export default function GameIdleList({ gameList, favorites, cardFarming, achievementUnlocker, setFavorites, setAchievementUnlocker, setCardFarming, showStats, showAchievements, setShowAchievements, setAppId }) {
    const [isLoading, setIsLoading] = useState(true);

    setTimeout(() => {
        setIsLoading(false);
    }, 100);

    const handleIdle = async (appId, appName) => {
        const idleStatus = await startIdler(appId, appName);
        if (idleStatus) {
            toast.success(`Started idling ${appName}`);
        } else {
            toast.error('Steam is not running');
        }
    };

    const addToFavorites = (e, item) => {
        e.stopPropagation();
        setTimeout(() => {
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            favorites.push(JSON.stringify(item));
            localStorage.setItem('favorites', JSON.stringify(favorites));
            const newFavorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
            setFavorites(newFavorites.map(JSON.parse));
            logEvent(`[Favorites] Added ${item.game.name} (${item.game.id})`);
        }, 500);
    };

    const removeFromFavorites = (e, item) => {
        e.stopPropagation();
        setTimeout(() => {
            const favorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
            const updatedFavorites = favorites.filter(arr => JSON.parse(arr).game.id !== item.game.id);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            const newFavorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
            setCardFarming(newFavorites.map(JSON.parse));
            logEvent(`[Favorites] Removed ${item.game.name} (${item.game.id})`);
        }, 500);
    };

    const addToCardFarming = (e, item) => {
        e.stopPropagation();
        setTimeout(() => {
            let cardFarming = JSON.parse(localStorage.getItem('cardFarming')) || [];
            cardFarming.push(JSON.stringify(item));
            localStorage.setItem('cardFarming', JSON.stringify(cardFarming));
            const newCardFarming = (localStorage.getItem('cardFarming') && JSON.parse(localStorage.getItem('cardFarming'))) || [];
            setCardFarming(newCardFarming.map(JSON.parse));
            logEvent(`[Card Farming] Added ${item.game.name} (${item.game.id})`);
        }, 500);
    };

    const removeFromCardFarming = (e, item) => {
        e.stopPropagation();
        setTimeout(() => {
            const cardFarming = (localStorage.getItem('cardFarming') && JSON.parse(localStorage.getItem('cardFarming'))) || [];
            const updatedCardFarming = cardFarming.filter(arr => JSON.parse(arr).game.id !== item.game.id);
            localStorage.setItem('cardFarming', JSON.stringify(updatedCardFarming));
            const newCardFarming = (localStorage.getItem('cardFarming') && JSON.parse(localStorage.getItem('cardFarming'))) || [];
            setCardFarming(newCardFarming.map(JSON.parse));
            logEvent(`[Card Farming] Removed ${item.game.name} (${item.game.id})`);
        }, 500);
    };

    const addToAchievementUnlocker = (e, item) => {
        e.stopPropagation();
        setTimeout(() => {
            let achievementUnlocker = JSON.parse(localStorage.getItem('achievementUnlocker')) || [];
            achievementUnlocker.push(JSON.stringify(item));
            localStorage.setItem('achievementUnlocker', JSON.stringify(achievementUnlocker));
            const newAchievementUnlocker = (localStorage.getItem('achievementUnlocker') && JSON.parse(localStorage.getItem('achievementUnlocker'))) || [];
            setAchievementUnlocker(newAchievementUnlocker.map(JSON.parse));
            logEvent(`[Achievement Unlocker] Added ${item.game.name} (${item.game.id})`);
        }, 500);
    };

    const removeFromAchievementUnlocker = (e, item) => {
        e.stopPropagation();
        setTimeout(() => {
            const achievementUnlocker = (localStorage.getItem('achievementUnlocker') && JSON.parse(localStorage.getItem('achievementUnlocker'))) || [];
            const updatedAchievementUnlocker = achievementUnlocker.filter(arr => JSON.parse(arr).game.id !== item.game.id);
            localStorage.setItem('achievementUnlocker', JSON.stringify(updatedAchievementUnlocker));
            const newAchievementUnlocker = (localStorage.getItem('achievementUnlocker') && JSON.parse(localStorage.getItem('achievementUnlocker'))) || [];
            setAchievementUnlocker(newAchievementUnlocker.map(JSON.parse));
            logEvent(`[Achievement Unlocker] Removed ${item.game.name} (${item.game.id})`);
        }, 500);
    };

    const viewAchievments = (item) => {
        setAppId(item.game.id);
        setShowAchievements(!showAchievements);
    };

    if (isLoading) return <Loader />;

    return (
        <React.Fragment>
            <div className='flex flex-wrap gap-4'>
                {gameList && gameList.map((item) => {
                    return (
                        <div key={item.game.id} className='relative flex flex-col w-full max-w-[220px] bg-container border border-border hover:border-borderhover rounded'>
                            <div className='flex w-fit min-h-[100px] overflow-hidden group' onClick={() => { handleIdle(item.game.id, item.game.name); }}>
                                <Image
                                    className='rounded-tl rounded-tr object-cover group-hover:scale-105 duration-200 cursor-pointer'
                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.game.id}/header.jpg`}
                                    width={220}
                                    height={100}
                                    alt={`${item.game.name} image`}
                                    priority={true}
                                />

                                <div className='absolute max-h-[100px] inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200 pointer-events-none'>
                                    <div className='flex justify-center items-center bg-black bg-opacity-50 rounded-lg p-2'>
                                        <IoPlay className='text-white' fontSize={50} />
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col px-2'>
                                <div className='flex justify-between items-center w-full gap-2'>
                                    <p className='text-sm font-bold truncate'>
                                        {item.game.name}
                                    </p>

                                    <div className='flex justify-end items-center gap-2 p-1'>
                                        <CardMenu
                                            item={item}
                                            favorites={favorites}
                                            cardFarming={cardFarming}
                                            achievementUnlocker={achievementUnlocker}
                                            handleIdle={handleIdle}
                                            viewAchievments={viewAchievments}
                                            addToFavorites={addToFavorites}
                                            removeFromFavorites={removeFromFavorites}
                                            addToCardFarming={addToCardFarming}
                                            removeFromCardFarming={removeFromCardFarming}
                                            addToAchievementUnlocker={addToAchievementUnlocker}
                                            removeFromAchievementUnlocker={removeFromAchievementUnlocker}
                                        />
                                    </div>
                                </div>

                                {showStats && (
                                    <CardStats item={item} />
                                )}
                            </div>
                        </div>
                    );
                })}
                <ToastContainer toastStyle={{ fontSize: 12 }} position='bottom-right' theme='dark' transition={Slide} pauseOnFocusLoss={false} pauseOnHover={false} autoClose={3000} />
            </div>
        </React.Fragment>
    );
}