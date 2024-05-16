import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import moment from 'moment';
import { invoke } from '@tauri-apps/api/tauri';
import { Input, Select, SelectItem, Skeleton } from '@nextui-org/react';
import { MdAvTimer } from "react-icons/md";
import { IoGameController } from 'react-icons/io5';
import { RiSearchLine } from "react-icons/ri";
import { TiHeartFullOutline } from "react-icons/ti";
import { AiOutlineSortAscending } from "react-icons/ai";
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function minutesToHoursCompact(number) {
    const durationInMinutes = number;
    const duration = moment.duration(durationInMinutes, 'minutes');
    const hours = Math.floor(duration.asHours());
    return hours.toLocaleString();
}

export const sortOptions = [
    { label: 'Name A to Z', value: 'a-z' },
    { label: 'Name Z to A', value: 'z-a' },
    { label: 'Playtime High to Low', value: '1-0' },
    { label: 'Playtime Low to High', value: '0-1' },
    { label: 'Favorited Games', value: 'fav' },
    { label: 'Recently Played', value: 'recent' },
];

export default function GameList({ steamId }) {
    let [gameList, setGameList] = useState(null);
    const [sortStyle, setSortStyle] = useState('a-z');
    const [isQuery, setIsQuery] = useState(false);
    const [favorites, setFavorites] = useState(null);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        fetch(`https://steeeam.vercel.app/api/ext-user-game-list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { steamId: steamId } }),
        }).then(async res => {
            if (res.status !== 500) {
                const gameList = await res.json();
                setGameList(gameList);
            }
        });
    }, []);

    useEffect(() => {
        const favorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
        setFavorites(favorites.map(JSON.parse));
    }, []);

    const handleClick = async (appId) => {
        const status = await invoke('check_status');
        if (status) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'lib\\steam-idle.exe');
            await invoke('idle_game', { filePath: fullPath, argument: appId.toString() });
        } else {
            toast.error('Steam is not running');
        }
    };

    const handleSelection = (e, value) => {
        setSortStyle(e.currentKey)
    };

    const handleQuery = () => {
        setIsQuery(true)
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        handleQuery('query');
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

    if (sortStyle === 'a-z') {
        gameList && gameList.sort((gameA, gameB) => {
            const nameA = gameA.game.name.toLowerCase();
            const nameB = gameB.game.name.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    } else if (sortStyle === 'z-a') {
        gameList && gameList.sort((gameA, gameB) => {
            const nameA = gameA.game.name.toLowerCase();
            const nameB = gameB.game.name.toLowerCase();
            return nameB.localeCompare(nameA);
        });
    } else if (sortStyle === '1-0') {
        gameList && gameList.sort((a, b) => b.minutes - a.minutes);
    } else if (sortStyle === '0-1') {
        gameList && gameList.sort((a, b) => a.minutes - b.minutes);
    } else if (sortStyle === 'recent') {
        gameList && gameList.sort((a, b) => b.lastPlayedTimestamp - a.lastPlayedTimestamp);
    } else if (sortStyle === 'fav') {
        const favorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
        gameList = favorites.map(JSON.parse);
    }

    if (isQuery) {
        const filteredGames = gameList.filter(item =>
            item.game.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        gameList = filteredGames;
    }

    return (
        <div className='pt-16'>
            <div className='flex flex-col p-5'>
                <div className='flex justify-between items-center mb-10'>
                    <div className='w-[500px]'>
                        <Input
                            placeholder='Search for a game'
                            startContent={<RiSearchLine />}
                            size='sm'
                            value={inputValue}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            classNames={{
                                inputWrapper: ['rounded-md', 'border', 'border-light-border']
                            }}
                        />
                    </div>

                    <div className='flex items-center gap-2'>
                        <Select
                            size='sm'
                            radius='sm'
                            aria-label='sort'
                            disallowEmptySelection
                            startContent={<AiOutlineSortAscending fontSize={22} />}
                            className='min-w-[230px]'
                            defaultSelectedKeys={['a-z']}
                            onSelectionChange={(e) => handleSelection(e, 'test')}
                            classNames={{
                                trigger: ['rounded-md', 'border', 'border-light-border']
                            }}
                        >
                            {sortOptions.map((item) => (
                                <SelectItem
                                    aria-label={item.value}
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                </div>

                {gameList ? (
                    <React.Fragment>
                        {gameList && gameList.length > 1 ? (
                            <p className='text-sm text-dull mb-2'>
                                {gameList.length} games
                            </p>
                        ) : gameList.length === 0 ? (
                            <p className='text-sm text-dull mb-2'>
                                0 games
                            </p>
                        ) : (
                            <p className='text-sm text-dull mb-2'>
                                {gameList.length} game
                            </p>
                        )}
                        <div className='flex gap-x-4 gap-y-8 flex-wrap'>
                            {gameList && gameList.map((item, index) => {
                                return (
                                    <div
                                        className='relative min-w-[200px] max-w-[200px] cursor-pointer border border-light-border hover:bg-base-hover hover:border-hover-border rounded overflow-hidden group'
                                        key={item.game.id}
                                        onClick={() => handleClick(item.game.id)}
                                    >
                                        <Image
                                            className='object-cover rounded-tl rounded-tr group-hover:scale-[1.03] duration-150'
                                            src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.game.id}/header.jpg`}
                                            width={231}
                                            height={87}
                                            alt={`${item.game.name} capsule image`}
                                        />

                                        <p className='text-center font-medium truncate p-2'>
                                            {item.game.name}
                                        </p>

                                        <div className='flex justify-between items-center flex-col w-full pb-2'>
                                            <div className='flex items-center gap-1 text-xs'>
                                                <MdAvTimer className='text-yellow-400' fontSize={16} />
                                                <div>
                                                    {parseInt(minutesToHoursCompact(item.minutes)) > 1 ? (
                                                        <p>{minutesToHoursCompact(item.minutes)} hours</p>
                                                    ) : parseInt(minutesToHoursCompact(item.minutes)) === 0 ? (
                                                        <p>Never played</p>
                                                    ) : (
                                                        <p>{minutesToHoursCompact(item.minutes)} hour</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className='flex items-center gap-1 text-xs'>
                                                <IoGameController className='text-blue-400' fontSize={14} />
                                                <div>
                                                    {item.lastPlayedTimestamp > 0 ? (
                                                        <p>{moment.unix(item.lastPlayedTimestamp).format("MMM D, YYYY")}</p>
                                                    ) : (
                                                        <p>-</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='absolute top-0 right-0 p-1'>
                                            {favorites.some(arr => arr.game.id === item.game.id) ? (
                                                <div className='text-white bg-neutral-800 hover:bg-neutral-700 bg-opacity-40 rounded p-1' onClick={(e) => removeFromFavorites(e, item)}>
                                                    <TiHeartFullOutline className='text-green-400' fontSize={16} />
                                                </div>
                                            ) : (
                                                <div className='text-white bg-neutral-800 hover:bg-neutral-700 bg-opacity-40 rounded p-1' onClick={(e) => addToFavorites(e, item)}>
                                                    <TiHeartFullOutline fontSize={16} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </React.Fragment>
                ) : (
                    <div className='flex gap-x-4 gap-y-8 flex-wrap mt-6'>
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                        <Skeleton className='min-w-[200px] min-h-[134.5px] rounded' />
                    </div>
                )}

                <ToastContainer position='bottom-right' theme='dark' transition={Slide} pauseOnFocusLoss={false} pauseOnHover={false} autoClose={3000} />
            </div>
        </div>
    )
}