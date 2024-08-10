import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import Loader from './Loader';
import Image from 'next/image';
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUnlockAlt, FaLock } from 'react-icons/fa';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { RiSearchLine } from 'react-icons/ri';

export default function Achievements({ steamId, appId, setShowAchievements }) {
    let [isLoading, setIsLoading] = useState(false);
    let [achievementList, setAchievementList] = useState([]);
    let [userAchievements, setUserAchievements] = useState([]);
    let [gameAchievementsPercentages, setGameAchievementsPercentages] = useState([]);
    const [isSorted, setIsSorted] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetch('https://steeeam.vercel.app/api/ext-game-schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { appId: appId } }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    console.log(data);

                    setAchievementList(data.availableGameStats.achievements);
                }
            }),
            fetch('https://steeeam.vercel.app/api/ext-user-achievements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { steamId: steamId, appId: appId } }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setUserAchievements(data.achievements);
                }
            }),
            fetch('https://steeeam.vercel.app/api/ext-game-achievement-percentage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { appId: appId } }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setGameAchievementsPercentages(data);
                }
            })
        ]).finally(() => setIsLoading(false));
    }, [steamId, appId]);

    const userAchievementsMap = new Map();
    userAchievements.forEach(item => userAchievementsMap.set(item.name, item.unlocked));

    const percentageMap = new Map();
    gameAchievementsPercentages.forEach(item => percentageMap.set(item.name, item.percent));

    if (!isSorted) {
        achievementList = [...achievementList].sort((a, b) => {
            const percentA = percentageMap.get(a.name) || 0;
            const percentB = percentageMap.get(b.name) || 0;
            return percentB - percentA;
        });
    };

    if (inputValue.length > 0) {
        achievementList = achievementList.filter(achievement =>
            achievement.displayName.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    const unlockAchievement = async (achievementId) => {
        const status = await invoke('check_status');
        if (status) {
            const path = await invoke('get_file_path');
            const fullPath = path.replace('Steam Game Idler.exe', 'libs\\AchievementUnlocker.exe');
            await invoke('unlock_achievement', {
                filePath: fullPath,
                appId: appId.toString(),
                achievementId: achievementId
            });
        } else {
            toast.error('Steam is not running');
        }
    };

    const handleClick = () => {
        setShowAchievements(false);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

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

    if (isLoading) return <Loader />;

    return (
        <React.Fragment>
            <div className='flex justify-between items-center'>
                <Button className='w-fit bg-[#F4F4F5] dark:bg-[#27272A] border border-border hover:border-borderhover rounded' radius='none' startContent={<IoMdArrowRoundBack fontSize={18} />} onClick={handleClick}>
                    Back to games list
                </Button>

                <Input
                    isClearable
                    placeholder='Search for achievement'
                    startContent={<RiSearchLine />}
                    className='max-w-[400px]'
                    classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                    value={inputValue}
                    onChange={handleInputChange}
                    onClear={() => { setInputValue(''); }}
                />

                <div className='flex gap-2'>
                    <Select
                        isDisabled={inputValue.length > 0}
                        disallowEmptySelection
                        radius='none'
                        size='sm'
                        items={sortOptions}
                        label='Sort by:'
                        className='w-[200px] border border-border hover:border-borderhover rounded-sm'
                        defaultSelectedKeys={['percent']}
                        onSelectionChange={(e) => { handleChange(e); }}
                    >
                        {(item) => <SelectItem>{item.label}</SelectItem>}
                    </Select>
                </div>
            </div>

            <div className='flex flex-wrap gap-4 mt-2'>
                <div>
                    <p className='text-xs italic'>
                        Please note that unlocking/locking achievements is instant but may take up to 5 minutes to be reflected on this page. Check your Steam game achievements for real-time changes.
                    </p>
                </div>

                {achievementList && achievementList.map((item) => {
                    const isUnlocked = userAchievementsMap.get(item.name) || false;
                    const percentage = percentageMap.get(item.name);

                    return (
                        <div key={item.name} className='flex items-center w-full bg-container border border-border hover:bg-containerhover hover:border-borderhover rounded'>
                            <Image
                                className='rounded'
                                src={isUnlocked ? item.icon : item.icongray}
                                width={50}
                                height={50}
                                alt={`${item.name} image`}
                            />

                            <div className='flex justify-between items-center w-full h-full px-4' style={{ background: `linear-gradient(to right, var(--percent) ${percentage}%, transparent ${percentage}%)` }}>
                                <div className='flex flex-col'>
                                    <p className='font-bold'>
                                        {item.displayName}
                                    </p>

                                    {item.description ? (
                                        <p className='text-sm'>{item.description}</p>
                                    ) : (
                                        <p className='italic text-sm'>Hidden achievement</p>
                                    )}
                                </div>

                                <p className='text-sm font-semibold'>
                                    {percentage.toFixed(1)}%
                                </p>
                            </div>

                            <div className='h-full ml-auto'>
                                {!isUnlocked ? (
                                    <Button
                                        startContent={<FaUnlockAlt fontSize={18} />}
                                        className='h-full rounded-none bg-green-300 dark:bg-[#41b16b] min-w-[105px]'
                                        onClick={() => { unlockAchievement(item.name); }}
                                    >Unlock</Button>
                                ) : (
                                    <Button
                                        startContent={<FaLock fontSize={18} />}
                                        className='h-full rounded-none bg-red-300 dark:bg-[#bd5454] min-w-[105px]'
                                        onClick={() => { unlockAchievement(item.name); }}
                                    >Lock</Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <ToastContainer position='bottom-right' theme='dark' transition={Slide} pauseOnFocusLoss={false} pauseOnHover={false} autoClose={3000} />
        </React.Fragment>
    );
}