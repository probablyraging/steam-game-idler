import React, { useState } from 'react';
import Image from 'next/image';
import CardMenu from './CardMenu';
import Loader from '../Loader';
import { FaAward } from 'react-icons/fa';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { startIdler, logEvent } from '@/utils/utils';

export default function GameAchievementList({ gameList, favorites, cardFarming, achievementUnlocker, setFavorites, setAchievementUnlocker, setCardFarming, showAchievements, setShowAchievements, setAppId }) {
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
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
                {gameList && gameList.map((item) => (
                    <div key={item.game.id} className='relative group'>
                        <div
                            className='aspect-[460/215] rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 ease-in-out transform group-hover:scale-105'
                            onClick={() => viewAchievments(item)}
                        >
                            <Image
                                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.game.id}/header.jpg`}
                                layout='fill'
                                objectFit='cover'
                                alt={`${item.game.name} image`}
                                priority={true}
                            />
                            <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center'>
                                <div className='flex flex-col justify-center items-center bg-black bg-opacity-0 group-hover:bg-opacity-40 p-2 rounded-md duration-200'>
                                    <FaAward className='text-offwhite opacity-0 group-hover:opacity-100 transition-opacity duration-200' fontSize={40} />
                                </div>
                            </div>
                        </div>

                        <div className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
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
                ))}
            </div>
            <ToastContainer toastStyle={{ fontSize: 12 }} position='bottom-right' theme='dark' transition={Slide} pauseOnFocusLoss={false} pauseOnHover={false} autoClose={5000} />
        </React.Fragment>
    );
}