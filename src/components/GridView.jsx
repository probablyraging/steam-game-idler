import React, { useState } from 'react';
import Image from 'next/image';
import { TiHeartFullOutline } from 'react-icons/ti';
import SelectedGames from './SelectedGames';
import IdlingState from './IdlingState';

export default function GridView({ gameList, favorites, setFavorites }) {
    const [selectedGames, setSelectedGames] = useState([]);
    const [selectedGamesNames, setSelectedGamesNames] = useState([]);
    const [idlingState, setIdlingState] = useState(false);

    const startIdler = async () => {
        const steamAuth = localStorage.getItem('steamAuth');

        fetch('api/start-idle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { gameIds: selectedGames, steamAuth: JSON.parse(steamAuth) } }),
        }).then(async res => {
            if (res.status !== 500) {
                setIdlingState(true);
                clearSelected();
            }
        });
    };

    const stopIdler = async () => {
        const steamAuth = localStorage.getItem('steamAuth');

        fetch('api/stop-idle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { steamAuth: JSON.parse(steamAuth) } }),
        }).then(async res => {
            if (res.status !== 500) {
                setIdlingState(false);
            }
        });
    };

    const handleClick = (gameId, name) => {
        if (selectedGames.includes(gameId)) {
            setSelectedGames(selectedGames.filter(id => id !== gameId));
        } else {
            setSelectedGames([...selectedGames, gameId]);
        }
        const existingGame = selectedGamesNames.find(item => item.gameId === gameId);
        if (existingGame) {
            setSelectedGamesNames(selectedGamesNames.filter(item => item.gameId !== gameId));
        } else {
            setSelectedGamesNames([...selectedGamesNames, { name, gameId }]);
        }
    };

    const clearSelected = () => {
        setSelectedGames([]);
        setSelectedGamesNames([]);
    };

    const addToFavorites = (e, item) => {
        e.stopPropagation();
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.push(JSON.stringify(item));
        localStorage.setItem('favorites', JSON.stringify(favorites));
        const newFavorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
        setFavorites(newFavorites.map(JSON.parse));
    };

    const removeFromFavorites = (e, item) => {
        e.stopPropagation();
        const favorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
        const updatedFavorites = favorites.filter(arr => JSON.parse(arr).game.id !== item.game.id);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        const newFavorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
        setFavorites(newFavorites.map(JSON.parse));
    };

    return (
        <React.Fragment>
            <div className='flex flex-wrap gap-4'>
                {gameList && gameList.map((item) => {
                    return (
                        <div
                            className={`relative flex flex-col w-full max-w-[245px] border ${selectedGames.includes(item.game.id) ? 'bg-containerselected' : 'bg-container hover:bg-containerhover hover:border-borderhover'} border-border rounded cursor-pointer group`}
                            onClick={() => handleClick(item.game.id, item.game.name)}
                            key={item.game.id}
                        >
                            <div className='flex w-fit min-h-[100px] overflow-hidden'>
                                <Image
                                    className='rounded-tl rounded-tr object-cover group-hover:scale-105 duration-200'
                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.game.id}/header.jpg`}
                                    width={245}
                                    height={100}
                                    alt={`${item.game.name} image`}
                                />
                            </div>
                            <div className='flex justify-center items-center flex-col p-2'>
                                <div className='max-w-[170px]'>
                                    <p className='font-bold truncate'>
                                        {item.game.name}
                                    </p>
                                </div>
                            </div>
                            <div className='absolute top-0 right-0 p-1'>
                                {favorites.some(arr => arr.game.id === item.game.id) ? (
                                    <div className='text-white bg-neutral-800 hover:bg-neutral-700 bg-opacity-60 rounded p-1' onClick={(e) => removeFromFavorites(e, item)}>
                                        <TiHeartFullOutline className='text-favoriteicon' fontSize={16} />
                                    </div>
                                ) : (
                                    <div className='text-white bg-neutral-800 hover:bg-neutral-700 bg-opacity-60 rounded p-1' onClick={(e) => addToFavorites(e, item)}>
                                        <TiHeartFullOutline fontSize={16} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {selectedGamesNames.length > 0 && (
                    <SelectedGames selectedGamesNames={selectedGamesNames} clearSelected={clearSelected} startIdler={startIdler} handleClick={handleClick} />
                )}
                {idlingState && (
                    <IdlingState stopIdler={stopIdler} />
                )}
            </div>
        </React.Fragment>
    );
}