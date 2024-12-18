import React, { useEffect, useState, useRef } from 'react';
import PageHeader from './PageHeader';
import GameCard from './GameCard';
import Private from './Private';
import Loader from '../Loader';
import { invoke } from '@tauri-apps/api/tauri';
import { logEvent } from '@/utils/utils';
import { toast } from 'react-toastify';

export default function GamesList({ steamId, inputValue, isQuery, setActivePage, setAppId, setAppName, showAchievements, setShowAchievements }) {
    const scrollContainerRef = useRef(null);
    let [isLoading, setIsLoading] = useState(true);
    let [gameList, setGameList] = useState(null);
    let [recentGames, setRecentGames] = useState(null);
    const [sortStyle, setSortStyle] = useState('a-z');
    const [favorites, setFavorites] = useState(null);
    const [cardFarming, setCardFarming] = useState(null);
    const [autoIdle, setAutoIdle] = useState(null);
    const [achievementUnlocker, setAchievementUnlocker] = useState(null);
    const [filteredGames, setFilteredGames] = useState([]);
    const [visibleGames, setVisibleGames] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);
    const gamesPerPage = 50;

    useEffect(() => {
        const getGamesList = async () => {
            try {
                setIsLoading(true);
                const sortStyle = localStorage.getItem('sortStyle');
                if (sortStyle) setSortStyle(sortStyle);
                const cachedGameList = sessionStorage.getItem('gamesListCache');
                const cachedRecentGames = sessionStorage.getItem('recentGamesCache');
                if (cachedGameList && cachedGameList !== null) {
                    const parsedGameList = JSON.parse(cachedGameList);
                    const parsedRecentGames = JSON.parse(cachedRecentGames);
                    setGameList(parsedGameList);
                    setRecentGames(parsedRecentGames);
                    setVisibleGames(parsedGameList.slice(0, gamesPerPage));
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 100);
                } else {
                    const apiKey = localStorage.getItem('apiKey');
                    const res = await invoke('get_games_list', { steamId: steamId, apiKey: apiKey });
                    const resTwo = await invoke('get_recent_games', { steamId: steamId });
                    const gameList = res.response.games || null;
                    const recentGames = resTwo.response.games || [];
                    setGameList(gameList);
                    setRecentGames(recentGames);
                    setVisibleGames(gameList.slice(0, gamesPerPage));
                    sessionStorage.setItem('gamesListCache', JSON.stringify(gameList));
                    sessionStorage.setItem('recentGamesCache', JSON.stringify(recentGames));
                    setIsLoading(false);
                }
            } catch (error) {
                setIsLoading(false);
                toast.error(`Error in (getGamesList): ${error?.message}`);
                console.error('Error in (getGamesList):', error);
                logEvent(`[Error] in (getGamesList): ${error}`);
            }
        };
        getGamesList();
    }, [steamId, refreshKey]);

    useEffect(() => {
        try {
            if (gameList) {
                let sortedAndFilteredGames = [...gameList];
                if (sortStyle === 'a-z') {
                    sortedAndFilteredGames.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sortStyle === 'z-a') {
                    sortedAndFilteredGames.sort((a, b) => b.name.localeCompare(a.name));
                } else if (sortStyle === '1-0') {
                    sortedAndFilteredGames.sort((a, b) => b.playtime_forever - a.playtime_forever);
                } else if (sortStyle === '0-1') {
                    sortedAndFilteredGames.sort((a, b) => a.playtime_forever - b.playtime_forever);
                } else if (sortStyle === 'recent') {
                    sortedAndFilteredGames = recentGames.filter(a => a.name !== 'Spacewar');
                } else if (sortStyle === 'favorite') {
                    const favorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
                    sortedAndFilteredGames = favorites.map(JSON.parse);
                } else if (sortStyle === 'cardFarming') {
                    const cardFarming = (localStorage.getItem('cardFarming') && JSON.parse(localStorage.getItem('cardFarming'))) || [];
                    sortedAndFilteredGames = cardFarming.map(JSON.parse);
                } else if (sortStyle === 'achievementUnlocker') {
                    const achievementUnlocker = (localStorage.getItem('achievementUnlocker') && JSON.parse(localStorage.getItem('achievementUnlocker'))) || [];
                    sortedAndFilteredGames = achievementUnlocker.map(JSON.parse);
                } else if (sortStyle === 'autoIdle') {
                    const autoIdle = (localStorage.getItem('autoIdle') && JSON.parse(localStorage.getItem('autoIdle'))) || [];
                    sortedAndFilteredGames = autoIdle.map(JSON.parse);
                }
                if (isQuery && inputValue && inputValue.trim().length > 0) {
                    sortedAndFilteredGames = sortedAndFilteredGames.filter(item =>
                        item.name.toLowerCase().includes(inputValue.toLowerCase().trim())
                    );
                }
                setFilteredGames(sortedAndFilteredGames);
                setVisibleGames(sortedAndFilteredGames.slice(0, gamesPerPage));
                setCurrentPage(1);
            }
        } catch (error) {
            toast.error(`Error in sorting list: ${error?.message}`);
            console.error('Error sorting lists:', error);
            logEvent(`[Error] sorting lists: ${error}`);
        }
    }, [gameList, recentGames, favorites, cardFarming, achievementUnlocker, autoIdle, sortStyle, isQuery, inputValue]);

    useEffect(() => {
        try {
            const favorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
            setFavorites(favorites.map(JSON.parse));
            const cardFarming = (localStorage.getItem('cardFarming') && JSON.parse(localStorage.getItem('cardFarming'))) || [];
            setCardFarming(cardFarming.map(JSON.parse));
            const achievementUnlocker = (localStorage.getItem('achievementUnlocker') && JSON.parse(localStorage.getItem('achievementUnlocker'))) || [];
            setAchievementUnlocker(achievementUnlocker.map(JSON.parse));
            const autoIdle = (localStorage.getItem('autoIdle') && JSON.parse(localStorage.getItem('autoIdle'))) || [];
            setAutoIdle(autoIdle.map(JSON.parse));
        } catch (error) {
            toast.error(`Error getting list: ${error?.message}`);
            console.error('Error getting lists:', error);
            logEvent(`[Error] getting lists: ${error}`);
        }
    }, []);

    useEffect(() => {
        const handleScroll = (event) => {
            try {
                const { scrollTop, scrollHeight, clientHeight } = event.target;
                if (scrollTop + clientHeight >= scrollHeight - 20) {
                    const nextPage = currentPage + 1;
                    const startIndex = (nextPage - 1) * gamesPerPage;
                    const endIndex = startIndex + gamesPerPage;
                    const newVisibleGames = filteredGames.slice(0, endIndex);
                    if (newVisibleGames.length > visibleGames.length) {
                        setVisibleGames(newVisibleGames);
                        setCurrentPage(nextPage);
                    }
                }
            } catch (error) {
                toast.error(`Error in (handleScroll): ${error?.message}`);
                console.error('Error in (handleScroll):', error);
                logEvent(`[Error] in (handleScroll): ${error}`);
            }
        };

        try {
            const scrollContainer = scrollContainerRef.current;
            if (scrollContainer) {
                scrollContainer.addEventListener('scroll', handleScroll);
                return () => scrollContainer.removeEventListener('scroll', handleScroll);
            }
        } catch (error) {
            toast.error(`Error setting up event listener: ${error?.message}`);
            console.error('Error setting up event listener:', error);
            logEvent(`[Error] setting up event listener: ${error}`);
        }
    }, [gameList, currentPage, visibleGames, filteredGames, gamesPerPage]);

    const handleScroll = (event) => {
        try {
            const { scrollTop, scrollHeight, clientHeight } = event.target;
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                const nextPage = currentPage + 1;
                const startIndex = (nextPage - 1) * gamesPerPage;
                const endIndex = startIndex + gamesPerPage;
                const newVisibleGames = filteredGames.slice(0, endIndex);
                if (newVisibleGames.length > visibleGames.length) {
                    setVisibleGames(newVisibleGames);
                    setCurrentPage(nextPage);
                }
            }
        } catch (error) {
            toast.error(`Error in (handleScroll): ${error?.message}`);
            console.error('Error in (handleScroll):', error);
            logEvent(`[Error] in (handleScroll): ${error}`);
        }
    };

    if (isLoading) return <Loader />;

    if (!gameList) return <Private steamId={steamId} setRefreshKey={setRefreshKey} />;

    return (
        <React.Fragment key={refreshKey}>
            <div className='w-calc min-h-calc max-h-calc overflow-y-auto overflow-x-hidden' onScroll={handleScroll}>
                {!showAchievements && (
                    <div className={`fixed w-[calc(100vw-72px)] z-[50] bg-opacity-90 backdrop-blur-md bg-base pl-4 pt-2 ${filteredGames?.length > 25 ? 'pr-4' : 'pr-2'}`}>
                        <PageHeader
                            steamId={steamId}
                            setActivePage={setActivePage}
                            sortStyle={sortStyle}
                            setSortStyle={setSortStyle}
                            filteredGames={filteredGames}
                            visibleGames={visibleGames}
                            setFavorites={setFavorites}
                            setRefreshKey={setRefreshKey}
                        />
                    </div>
                )}

                <div className='p-4 pt-2'>
                    <div className='mt-[60px]'>
                        <GameCard
                            gameList={visibleGames}
                            favorites={favorites}
                            cardFarming={cardFarming}
                            achievementUnlocker={achievementUnlocker}
                            autoIdle={autoIdle}
                            setFavorites={setFavorites}
                            setCardFarming={setCardFarming}
                            setAutoIdle={setAutoIdle}
                            setAchievementUnlocker={setAchievementUnlocker}
                            showAchievements={showAchievements}
                            setShowAchievements={setShowAchievements}
                            setAppId={setAppId}
                            setAppName={setAppName}
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}