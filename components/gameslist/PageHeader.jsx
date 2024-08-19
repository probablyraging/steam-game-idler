import React from 'react';
import { Button, Select, SelectItem, Tooltip } from '@nextui-org/react';
import { IoIosStats } from 'react-icons/io';
import { MdSort } from 'react-icons/md';
import Automate from './Automate';
import GamesWithDrops from './GamesWithDrops';

export default function PageHeader({ activePage, setActivePage, sortStyle, setSortStyle, showStats, handleShowStats, filteredGames, setFilteredGames, visibleGames, setVisibleGames }) {
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

    return (
        <React.Fragment>
            <div className='flex justify-between items-center pb-4'>
                <div className='flex justify-center items-center'>
                    {activePage === 'games' ? (
                        <div className='flex flex-col'>
                            <p className='text-lg font-semibold'>
                                Game Idler
                            </p>
                            <p className='text-xs'>
                                Click one or more games to begin idling manually
                            </p>
                        </div>
                    ) : (
                        <div className='flex flex-col'>
                            <p className='text-lg font-semibold'>
                                Achievement Unlocker
                            </p>
                            <p className='text-xs'>
                                Click a game to unlock achievements manually
                            </p>
                        </div>
                    )}
                </div>

                <div className='flex justify-end items-center gap-2'>
                    {sortStyle === 'cardFarming' && (
                        <GamesWithDrops setFilteredGames={setFilteredGames} setVisibleGames={setVisibleGames} />
                    )}

                    <div className='flex items-center gap-1'>
                        <Automate setActivePage={setActivePage} />
                    </div>

                    <Tooltip closeDelay={0} placement='top' className='text-xs' content='Show game information'>
                        <Button
                            isIconOnly
                            startContent={<IoIosStats fontSize={18} />}
                            size='sm'
                            className={`${showStats && 'text-sgi'} bg-container border border-border hover:bg-containerhover hover:border-borderhover rounded-sm`}
                            onClick={() => handleShowStats()}
                        />
                    </Tooltip>

                    <Select
                        aria-label='sort'
                        disallowEmptySelection
                        radius='none'
                        size='sm'
                        startContent={<MdSort fontSize={26} />}
                        items={sortOptions}
                        className='w-[240px] border border-border hover:border-borderhover rounded-sm'
                        defaultSelectedKeys={[sortStyle]}
                        onSelectionChange={(e) => { handleSorting(e); }}
                        classNames={{ listboxWrapper: ['min-h-[278px]'] }}
                    >
                        {(item) => <SelectItem>{item.label}</SelectItem>}
                    </Select>
                </div>
            </div>

            <div className='flex w-full'>
                <p className='text-xs text-gray-500 mb-2'>
                    Showing {visibleGames.length} of {filteredGames.length} games
                </p>
            </div>
        </React.Fragment >
    );
}