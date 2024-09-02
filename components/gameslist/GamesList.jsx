import React, { useEffect, useState, useRef } from 'react';
import PageHeader from './PageHeader';
import GameCard from './GameCard';
import Private from './Private';
import Loader from '../Loader';
import { invoke } from '@tauri-apps/api/tauri';

export default function GamesList({ steamId, inputValue, isQuery, setActivePage, setAppId, setAppName, showAchievements, setShowAchievements }) {
    const scrollContainerRef = useRef(null);
    let [isLoading, setIsLoading] = useState(true);
    let [gameList, setGameList] = useState(null);
    const [sortStyle, setSortStyle] = useState('a-z');
    const [favorites, setFavorites] = useState(null);
    const [cardFarming, setCardFarming] = useState(null);
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
                if (cachedGameList && cachedGameList !== null) {
                    const parsedGameList = JSON.parse(cachedGameList);
                    setGameList(parsedGameList);
                    setVisibleGames(parsedGameList.slice(0, gamesPerPage));
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 100);
                } else {
                    const res = await invoke('get_games_list', { steamId: steamId });
                    const gameList = res.response.games;
                    setGameList(gameList);
                    setVisibleGames(gameList.slice(0, gamesPerPage));
                    sessionStorage.setItem('gamesListCache', JSON.stringify(gameList));
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Errorin getGamesList:', error);
            }
        };
        getGamesList();
    }, [steamId, refreshKey]);

    useEffect(() => {
        if (gameList) {
            let sortedAndFilteredGames = [...gameList];
            if (sortStyle === 'a-z') {
                sortedAndFilteredGames.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortStyle === 'z-a') {
                sortedAndFilteredGames.sort((a, b) => b.name.localeCompare(a.name));
            } else if (sortStyle === '1-0') {
                sortedAndFilteredGames.sort((a, b) => b.minutes - a.minutes);
            } else if (sortStyle === '0-1') {
                sortedAndFilteredGames.sort((a, b) => a.minutes - b.minutes);
            } else if (sortStyle === 'recent') {
                sortedAndFilteredGames.sort((a, b) => b.lastPlayedTimestamp - a.lastPlayedTimestamp);
            } else if (sortStyle === 'favorite') {
                const favorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
                sortedAndFilteredGames = favorites.map(JSON.parse);
            } else if (sortStyle === 'cardFarming') {
                const cardFarming = (localStorage.getItem('cardFarming') && JSON.parse(localStorage.getItem('cardFarming'))) || [];
                sortedAndFilteredGames = cardFarming.map(JSON.parse);
            } else if (sortStyle === 'achievementUnlocker') {
                const achievementUnlocker = (localStorage.getItem('achievementUnlocker') && JSON.parse(localStorage.getItem('achievementUnlocker'))) || [];
                sortedAndFilteredGames = achievementUnlocker.map(JSON.parse);
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
    }, [gameList, favorites, cardFarming, achievementUnlocker, sortStyle, isQuery, inputValue]);

    useEffect(() => {
        const favorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
        setFavorites(favorites.map(JSON.parse));
        const cardFarming = (localStorage.getItem('cardFarming') && JSON.parse(localStorage.getItem('cardFarming'))) || [];
        setCardFarming(cardFarming.map(JSON.parse));
        const achievementUnlocker = (localStorage.getItem('achievementUnlocker') && JSON.parse(localStorage.getItem('achievementUnlocker'))) || [];
        setAchievementUnlocker(achievementUnlocker.map(JSON.parse));
    }, []);

    useEffect(() => {
        const cardFarming = (localStorage.getItem('cardFarming') && JSON.parse(localStorage.getItem('cardFarming'))) || [];
        setCardFarming(cardFarming.map(JSON.parse));
    }, []);

    useEffect(() => {
        const achievementUnlocker = (localStorage.getItem('achievementUnlocker') && JSON.parse(localStorage.getItem('achievementUnlocker'))) || [];
        setAchievementUnlocker(achievementUnlocker.map(JSON.parse));
    }, []);

    useEffect(() => {
        const handleScroll = (event) => {
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
        };

        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [gameList, currentPage, visibleGames, filteredGames, gamesPerPage]);

    const handleScroll = (event) => {
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
    };

    if (isLoading) return <Loader />;

    if (!gameList) return <Private steamId={steamId} />;

    return (
        <React.Fragment key={refreshKey}>
            <div className='w-calc min-h-calc max-h-calc overflow-y-auto overflow-x-hidden' onScroll={handleScroll}>
                <div className='p-4 pt-2'>
                    {!showAchievements && (
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
                    )}

                    <GameCard
                        gameList={visibleGames}
                        favorites={favorites}
                        cardFarming={cardFarming}
                        achievementUnlocker={achievementUnlocker}
                        setFavorites={setFavorites}
                        setCardFarming={setCardFarming}
                        setAchievementUnlocker={setAchievementUnlocker}
                        showAchievements={showAchievements}
                        setShowAchievements={setShowAchievements}
                        setAppId={setAppId}
                        setAppName={setAppName}
                    />
                </div>
            </div>
        </React.Fragment>
    );
}