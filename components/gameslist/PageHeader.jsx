import React from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { MdSort } from 'react-icons/md';
import Automate from './Automate';
import { toast } from 'react-toastify';
import moment from 'moment';
import { IoRefresh } from 'react-icons/io5';
import ManualAdd from './ManualAdd';

export default function PageHeader({ steamId, activePage, setActivePage, sortStyle, setSortStyle, filteredGames, visibleGames, setFavorites, setRefreshKey }) {
    const sortOptions = [
        { key: 'a-z', label: 'Title Ascending' },
        { key: 'z-a', label: 'Title Descending' },
        { key: '1-0', label: 'Playtime High-Low' },
        { key: '0-1', label: 'Playtime Low-High' },
        { key: 'recent', label: 'Recently Played' },
        { key: 'favorite', label: 'Favorited Games' },
        { key: 'cardFarming', label: 'Card Farming Games' },
        { key: 'achievementUnlocker', label: 'Achievement Unlocker Games' },
    ];

    const handleSorting = (e) => {
        localStorage.setItem('sortStyle', e.currentKey);
        setSortStyle(e.currentKey);
    };

    const handleRefetch = () => {
        if (steamId !== '76561198158912649' && steamId !== '76561198999797359') {
            const cooldown = sessionStorage.getItem('cooldown');
            if (cooldown && moment().unix() < cooldown) {
                return toast.error(`Games can be refreshed again at ${moment.unix(cooldown).format('h:mm A')}`);
            }
        }
        sessionStorage.removeItem('gamesListCache');
        sessionStorage.setItem('cooldown', moment().add(3, 'minutes').unix());
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <React.Fragment>
            <div className='flex justify-between items-center pb-2'>
                <div className='flex items-center gap-4'>
                    <div className='flex flex-col justify-center'>
                        {activePage === 'games' ? (
                            <div className='flex flex-col'>
                                <p className='text-lg font-semibold'>
                                    Game Idler
                                </p>
                            </div>
                        ) : (
                            <div className='flex flex-col'>
                                <p className='text-lg font-semibold'>
                                    Achievement Unlocker
                                </p>
                            </div>
                        )}
                        <div className='flex items-center gap-1'>
                            <p className='text-xs text-gray-400'>
                                Showing {visibleGames.length} of {filteredGames.length} games
                            </p>
                            <div className='flex justify-center items-center cursor-pointer' onClick={handleRefetch}>
                                <IoRefresh className='text-gray-400' fontSize={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex justify-end items-center gap-2'>
                    <ManualAdd setFavorites={setFavorites} />

                    <Automate setActivePage={setActivePage} />

                    <Select
                        aria-label='sort'
                        disallowEmptySelection
                        radius='none'
                        size='sm'
                        startContent={<MdSort fontSize={26} />}
                        items={sortOptions}
                        className='w-[240px]'
                        defaultSelectedKeys={[sortStyle]}
                        onSelectionChange={(e) => { handleSorting(e); }}
                        classNames={{
                            listbox: ['p-0'],
                            value: ['text-xs'],
                            trigger: ['bg-input border border-inputborder data-[hover=true]:!bg-titlebar data-[open=true]:!bg-titlebar duration-100 rounded-sm'],
                            popoverContent: ['bg-base border border-border rounded'],
                        }}
                    >
                        {(item) => <SelectItem classNames={{ title: ['text-xs'], base: ['rounded-sm'] }}>{item.label}</SelectItem>}
                    </Select>
                </div>
            </div>
        </React.Fragment>
    );
}