import React from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { MdSort } from 'react-icons/md';
import Automate from './Automate';

export default function PageHeader({ activePage, setActivePage, sortStyle, setSortStyle, filteredGames, visibleGames }) {
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
                <div className='flex items-center gap-4'>
                    <div className='flex justify-center items-center'>
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
                    </div>
                </div>

                <div className='flex justify-end items-center gap-2'>
                    <div className='flex items-center gap-1'>
                        <Automate setActivePage={setActivePage} />
                    </div>

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
                            listboxWrapper: ['min-h-[248px]'],
                            value: ['text-xs'],
                            trigger: ['bg-input border border-inputborder data-[hover=true]:!bg-titlebar data-[open=true]:!bg-titlebar duration-100 rounded-sm'],
                            popoverContent: ['bg-base border border-border rounded'],
                        }}
                    >
                        {(item) => <SelectItem classNames={{ title: ['text-xs'], base: ['rounded-sm'] }}>{item.label}</SelectItem>}
                    </Select>
                </div>
            </div>

            <div className='text-xs text-gray-400 mb-2'>
                Showing {visibleGames.length} of {filteredGames.length} games
            </div>
        </React.Fragment>
    );
}