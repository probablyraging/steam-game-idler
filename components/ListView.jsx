import React from 'react';
import Image from 'next/image';
import moment from 'moment';
import { invoke } from '@tauri-apps/api/tauri';
import { MdAvTimer } from 'react-icons/md';
import { IoLogoGameControllerB } from "react-icons/io";
import minutesToHoursCompact from '@/utils/utils';
import { TiHeartFullOutline } from 'react-icons/ti';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ListView({ gameList, favorites, setFavorites }) {
    const launchIdler = async (appId) => {
        const status = await invoke('check_status');
        if (status) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'lib\\steam-idle.exe');
            await invoke('idle_game', { filePath: fullPath, argument: appId.toString() });
        } else {
            toast.error('Steam is not running');
        }
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
            <div className='grid grid-cols-2 gap-6'>
                {gameList && gameList.map((item, index) => {
                    return (
                        <div
                            className='relative flex w-full h-[80px] bg-container gap-4 border border-border hover:bg-containerhover hover:border-borderhover rounded cursor-pointer group'
                            onClick={() => launchIdler(item.game.id)}
                            key={item.game.id}
                        >
                            <div className='flex w-fit min-h-[80px] overflow-hidden'>
                                <Image
                                    className='rounded-tl rounded-bl object-cover group-hover:scale-105 duration-200'
                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.game.id}/header.jpg`}
                                    width={220}
                                    height={100}
                                    alt={`${item.game.name} image`}
                                />
                            </div>
                            <div className='flex justify-between flex-col p-1'>
                                <div className='max-w-[270px]'>
                                    <p className='font-bold truncate'>
                                        {item.game.name}
                                    </p>
                                </div>

                                <div className='flex gap-6'>
                                    <div className='flex flex-col min-w-[150px]'>
                                        <p className='text-sm'>Playtime</p>
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
                                    </div>

                                    <div className='flex flex-col'>
                                        <p className='text-sm'>Last Played</p>
                                        <div className='flex items-center gap-1 text-xs'>
                                            <IoLogoGameControllerB className='text-blue-400' fontSize={16} />
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
                                            <div className='text-white bg-favorite hover:bg-favoritehover rounded p-1' onClick={(e) => removeFromFavorites(e, item)}>
                                                <TiHeartFullOutline className='text-favoriteicon' fontSize={16} />
                                            </div>
                                        ) : (
                                            <div className='text-black dark:text-white bg-favorite hover:bg-favoritehover rounded p-1' onClick={(e) => addToFavorites(e, item)}>
                                                <TiHeartFullOutline fontSize={16} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <ToastContainer position='bottom-right' theme='dark' transition={Slide} pauseOnFocusLoss={false} pauseOnHover={false} autoClose={3000} />
            </div>
        </React.Fragment>
    )
}