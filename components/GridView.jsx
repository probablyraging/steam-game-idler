import React from 'react';
import Image from 'next/image';
import moment from 'moment';
import { invoke } from '@tauri-apps/api/tauri';
import { TiHeartFullOutline } from 'react-icons/ti';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import minutesToHoursCompact from '@/utils/utils';
import { MdAvTimer } from 'react-icons/md';
import { IoLogoGameControllerB, IoMdTrophy } from 'react-icons/io';
import { Tooltip } from '@nextui-org/react';

export default function GridView({ gameList, favorites, setFavorites, showStats, showAchievements, setShowAchievements, setAppId }) {
    const launchIdler = async (appId) => {
        const status = await invoke('check_status');
        if (status) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'libs\\Idler.exe');
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

    const viewAchievments = (e, item) => {
        e.stopPropagation();
        setAppId(item.game.id);
        setShowAchievements(!showAchievements);
    };

    return (
        <React.Fragment>
            <div className='flex flex-wrap gap-4'>
                {gameList && gameList.map((item) => {
                    return (
                        <div
                            className='relative flex flex-col w-full max-w-[220px] bg-container border border-border hover:bg-containerhover hover:border-borderhover rounded cursor-pointer group'
                            onClick={() => launchIdler(item.game.id)}
                            key={item.game.id}
                        >
                            <div className='flex w-fit min-h-[100px] overflow-hidden'>
                                <Image
                                    className='rounded-tl rounded-tr object-cover group-hover:scale-105 duration-200'
                                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.game.id}/header.jpg`}
                                    width={220}
                                    height={100}
                                    alt={`${item.game.name} image`}
                                />
                            </div>
                            <div className='flex justify-center items-center flex-col p-2'>
                                <div className='max-w-[170px]'>
                                    <p className='font-bold text-center truncate'>
                                        {item.game.name}
                                    </p>

                                    {showStats && (
                                        <div className='flex items-center flex-col gap-2 mt-2'>
                                            <Tooltip closeDelay={0} placement='right' className='text-xs' content='Total playtime'>
                                                <div className='flex items-center gap-1 text-xs'>
                                                    <MdAvTimer className='text-yellow-400' fontSize={16} />
                                                    <div>
                                                        {minutesToHoursCompact(item.minutes) > 1 ? (
                                                            <p>{minutesToHoursCompact(item.minutes).toLocaleString()} hours</p>
                                                        ) : minutesToHoursCompact(item.minutes) === 0 ? (
                                                            <p>0 hours</p>
                                                        ) : (
                                                            <p>{minutesToHoursCompact(item.minutes).toLocaleString()} hour</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Tooltip>

                                            <Tooltip closeDelay={0} placement='right' className='text-xs' content='Last played'>
                                                <div className='flex items-center gap-1 text-xs'>
                                                    <IoLogoGameControllerB className='text-blue-400' fontSize={16} />
                                                    <div>
                                                        {item.lastPlayedTimestamp > 0 ? (
                                                            <p>{moment.unix(item.lastPlayedTimestamp).format('MMM D, YYYY')}</p>
                                                        ) : (
                                                            <p>Never played</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    )}
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

                            <div className='absolute top-0 right-7 p-1'>
                                <div className='text-white bg-neutral-800 hover:bg-neutral-700 bg-opacity-60 rounded p-1' onClick={(e) => viewAchievments(e, item)}>
                                    <IoMdTrophy fontSize={16} />
                                </div>
                            </div>
                        </div>
                    );
                })}
                <ToastContainer position='bottom-right' theme='dark' transition={Slide} pauseOnFocusLoss={false} pauseOnHover={false} autoClose={3000} />
            </div>
        </React.Fragment>
    );
}