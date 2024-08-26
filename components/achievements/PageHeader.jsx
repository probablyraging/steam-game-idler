import React from 'react';
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { MdSort } from 'react-icons/md';
import { RiSearchLine } from 'react-icons/ri';

export default function PageHeader({ setShowAchievements, achievementList, setAchievementList, setIsSorted, inputValue, setInputValue, percentageMap, userAchievementsMap }) {
    const sortOptions = [
        { key: 'percent', label: 'Percentage' },
        { key: 'title', label: 'Alphabetically' },
        { key: 'status', label: 'Locked/Unlocked' },
    ];

    const handleChange = (e) => {
        if (e.currentKey === 'title') {
            const sortedList = [...achievementList].sort((a, b) => {
                return a.displayName.localeCompare(b.displayName);
            });
            setAchievementList(sortedList);
        }
        if (e.currentKey === 'percent') {
            const sortedList = [...achievementList].sort((a, b) => {
                const percentA = percentageMap.get(a.name) || 0;
                const percentB = percentageMap.get(b.name) || 0;
                return percentB - percentA;
            });
            setAchievementList(sortedList);
        }
        if (e.currentKey === 'status') {
            const sortedList = [...achievementList].sort((a, b) => {
                const isUnlockedA = userAchievementsMap.get(a.name) || false;
                const isUnlockedB = userAchievementsMap.get(b.name) || false;
                return Number(isUnlockedB) - Number(isUnlockedA);
            });
            setAchievementList(sortedList);
        }
        setIsSorted(true);
    };

    const handleClick = () => {
        setShowAchievements(false);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <React.Fragment>
            <div className='flex justify-between items-center mb-4'>
                <Button
                    size='sm'
                    className='w-fit bg-[#f7f7f7] dark:bg-[#181818] hover:!bg-titlebar border border-inputborder rounded-sm duration-50'
                    startContent={<IoMdArrowRoundBack fontSize={18} />}
                    onClick={handleClick}
                >
                    Back to games list
                </Button>

                <Input
                    isClearable
                    size='sm'
                    isDisabled={!achievementList}
                    placeholder='Search for an achievement'
                    startContent={<RiSearchLine />}
                    className='max-w-[400px]'
                    classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-sm'] }}
                    value={inputValue}
                    onChange={handleInputChange}
                    onClear={() => { setInputValue(''); }}
                />

                <div className='flex gap-2'>
                    <Select
                        aria-label='sort'
                        isDisabled={inputValue.length > 0 || !achievementList}
                        disallowEmptySelection
                        radius='none'
                        size='sm'
                        startContent={<MdSort fontSize={26} />}
                        items={sortOptions}
                        className='w-[200px]'
                        classNames={{
                            listbox: ['p-0'],
                            value: ['text-xs'],
                            trigger: ['bg-input border border-inputborder data-[hover=true]:!bg-titlebar data-[open=true]:!bg-titlebar duration-100 rounded-sm'],
                            popoverContent: ['bg-base border border-border rounded']
                        }}
                        defaultSelectedKeys={['percent']}
                        onSelectionChange={(e) => { handleChange(e); }}
                    >
                        {(item) => <SelectItem classNames={{ title: ['text-xs'], base: ['rounded-sm'] }}>{item.label}</SelectItem>}
                    </Select>
                </div>
            </div>
        </React.Fragment>
    );
}