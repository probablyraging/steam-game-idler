import React, { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { IoListSharp, IoGridOutline } from 'react-icons/io5';
import ListView from './ListView';
import GridView from './GridView';
import Private from './Private';
import Loader from './Loader';

export default function GamesList({ steamId, sortStyle, inputValue, isQuery }) {
    let [isLoading, setIsLoading] = useState(false);
    let [gameList, setGameList] = useState(null);
    const [viewStyle, setViewStyle] = useState('grid');
    const [favorites, setFavorites] = useState(null);

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

    const handleViewStyle = (value) => {
        setViewStyle(value);
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
                    <div className='flex justify-end items-center w-full gap-2 pb-4'>
                        <Button
                            isIconOnly
                            startContent={<IoGridOutline fontSize={14} />}
                            size='sm'
                            className={`${viewStyle === 'grid' && 'text-sgi'} bg-container border border-border`}
                            onClick={() => handleViewStyle('grid')}
                        />

                        <Button
                            isIconOnly
                            startContent={<IoListSharp fontSize={18} />}
                            size='sm'
                            className={`${viewStyle === 'list' && 'text-sgi'} bg-container border border-border`}
                            onClick={() => handleViewStyle('list')}
                        />
                    </div>

                    {viewStyle === 'list' && (<ListView gameList={gameList} favorites={favorites} setFavorites={setFavorites} />)}
                    {viewStyle === 'grid' && (<GridView gameList={gameList} favorites={favorites} setFavorites={setFavorites} />)}
                </div>
            </div>
        </React.Fragment>
    );
}