import React, { useEffect, useState } from 'react';
import Loader from '../Loader';
import Image from 'next/image';
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUnlockAlt, FaLock, FaInfoCircle } from 'react-icons/fa';
import { IoIosClose, IoMdArrowRoundBack } from 'react-icons/io';
import { RiSearchLine } from 'react-icons/ri';
import { TiWarning } from 'react-icons/ti';
import { MdSort } from 'react-icons/md';
import { unlockAchievement } from '@/utils/utils';
import { useTheme } from 'next-themes';

export default function Achievements({ steamId, appId, setShowAchievements }) {
    const { theme } = useTheme();
    let [isLoading, setIsLoading] = useState(true);
    let [achievementList, setAchievementList] = useState([]);
    let [userAchievements, setUserAchievements] = useState([]);
    let [gameAchievementsPercentages, setGameAchievementsPercentages] = useState([]);
    const [isSorted, setIsSorted] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [achievementsUnavailable, setAchievementsUnavailable] = useState(false);
    const [needConfirmation, setNeedConfirmation] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [showAlertOne, setShowAlertOne] = useState(true);
    const [showAlertTwo, setShowAlertTwo] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetch('https://apibase.vercel.app/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'game-schema', appId: appId }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setAchievementList(data.availableGameStats?.achievements);
                }
            }),
            fetch('https://apibase.vercel.app/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-achievements', steamId: steamId, appId: appId }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setUserAchievements(data.achievements);
                } else {
                    setAchievementsUnavailable(true);
                }
            }),
            fetch('https://apibase.vercel.app/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'game-achievement-percentage', appId: appId }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setGameAchievementsPercentages(data);
                }
            })
        ]).finally(() => setIsLoading(false));
    }, [steamId, appId]);

    useEffect(() => {
        const alertOne = localStorage.getItem('alertOne');
        if (alertOne !== null) setShowAlertOne(alertOne);
        const alertTwo = localStorage.getItem('alertTwo');
        if (alertTwo !== null) setShowAlertTwo(alertTwo);
    }, []);

    const userAchievementsMap = new Map();
    userAchievements.forEach(item => userAchievementsMap.set(item.name, item.unlocked));

    const percentageMap = new Map();
    gameAchievementsPercentages.forEach(item => percentageMap.set(item.name, item.percent));

    if (!isSorted && achievementList && achievementList.length > 0) {
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

    const handleUnlockAll = async (step) => {
        if (step === 1) {
            setNeedConfirmation(true);
        } else if (step === 2) {
            setBtnLoading(true);
            let unlocked = 0;
            const total = achievementList.length;
            for (const ach of achievementList) {
                try {
                    await unlockAchievement(appId, ach.name, true);
                    unlocked++;
                    toast.info(`Unlocked ${unlocked} of ${total} achievements`, { autoClose: 1000 });
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (error) {
                    console.error(`Failed to unlock achievement ${ach.name}:`, error);
                }
            }
            setBtnLoading(false);
            setNeedConfirmation(false);
            toast.success(`Successfully unlocked ${unlocked} of ${total} achievements.`);
        } else {
            setNeedConfirmation(false);
        }
    };

    const handleAlert = (val) => {
        if (val === 1) {
            localStorage.setItem('alertOne', false);
            setShowAlertOne('false');
        }
        if (val === 2) {
            localStorage.setItem('alertTwo', false);
            setShowAlertTwo('false');
        }
    };

    if (isLoading) return <Loader />;

    return (
        <React.Fragment>
            <div className='min-h-calc max-h-calc w-full overflow-y-auto overflow-x-hidden'>
                <div className='p-4'>
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

                    {achievementsUnavailable && showAlertOne !== 'false' && (
                        <div className='flex justify-between items-center w-full p-1 bg-red-100 border border-red-300 rounded my-2'>
                            <div className='flex items-center gap-2 text-xs font-semibold text-red-400'>
                                <TiWarning fontSize={18} />
                                <p>Either this game has no achievements or your &quot;Game details&quot; setting might be set to private in your Steam privacy settings. You can still unlock achievements but the changes won&apos;t be reflected here.</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button
                                    isIconOnly
                                    size='sm'
                                    className='bg-transparent text-red-400 hover:text-red-500'
                                    startContent={<IoIosClose fontSize={24} />}
                                    onClick={() => { handleAlert(1); }}
                                />
                            </div>
                        </div>
                    )}

                    {showAlertTwo !== 'false' && (
                        <div className='flex justify-between items-center w-full p-1 bg-blue-100 border border-blue-300 rounded my-2'>
                            <div className='flex justify-between items-center w-full gap-2 text-xs font-semibold text-blue-400'>
                                <div className='flex items-center gap-2'>
                                    <FaInfoCircle fontSize={18} />
                                    <p>Please note that unlocking/locking achievements is instant but may take up to 5 minutes to be reflected on this page. Check your game&apos;s achievements page on Steam for real-time changes.</p>
                                </div>
                                <Button
                                    isIconOnly
                                    size='sm'
                                    className='bg-transparent text-blue-400 hover:text-blue-500'
                                    startContent={<IoIosClose fontSize={24} />}
                                    onClick={() => { handleAlert(2); }}
                                />
                            </div>
                        </div>
                    )}

                    <div className='flex flex-wrap gap-4 mt-2'>
                        <div className='flex w-full justify-end'>
                            {needConfirmation ? (
                                <div className='flex gap-2'>
                                    <Button size='sm' isLoading={btnLoading} className='bg-sgi font-semibold text-offwhite rounded-sm' onClick={() => { handleUnlockAll(2); }}>
                                        Continue
                                    </Button>
                                    <Button size='sm' isLoading={btnLoading} className='bg-red-400 font-semibold text-offwhite rounded-sm' onClick={() => { handleUnlockAll(3); }}>
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <React.Fragment>
                                    {!achievementsUnavailable && (
                                        <Button
                                            size='sm'
                                            isLoading={btnLoading}
                                            isDisabled={!achievementList || inputValue.length > 0}
                                            className='bg-sgi font-semibold text-offwhite rounded-sm'
                                            onClick={() => { handleUnlockAll(1); }}
                                        >
                                            Unlock all achievements
                                        </Button>
                                    )}
                                </React.Fragment>
                            )}
                        </div>

                        <div className='grid grid-cols-1 gap-4 max-h-[430px] p-2 w-full border border-border rounded overflow-y-auto'>
                            {achievementsUnavailable && (
                                <div className='flex justify-center items-center w-full'>
                                    <p className='text-xs'>
                                        No achievements found
                                    </p>
                                </div>
                            )}
                            {achievementList && achievementList.map((item) => {
                                const isUnlocked = userAchievementsMap.get(item.name) || false;
                                const percentage = percentageMap.get(item.name);

                                return (
                                    <div key={item.name} className='flex flex-col bg-container border border-border rounded shadow-sm'>
                                        <div className='flex items-center p-3 bg-gradient-to-r from-[#eee] to-[#f2f2f2] dark:from-[#121212] dark:to-[#1c1c1c]'>
                                            <Image
                                                className='rounded-full mr-3'
                                                src={isUnlocked ? item.icon : item.icongray}
                                                width={40}
                                                height={40}
                                                alt={`${item.name} image`}
                                            />
                                            <div className='flex flex-col w-full'>
                                                <p className='font-bold text-xs'>{item.displayName}</p>
                                                <div className='max-w-[250px]'>
                                                    <p className='text-xs text-gray-600 dark:text-gray-400  truncate'>{item.description || 'Hidden achievement'}</p>
                                                </div>
                                            </div>
                                            {isUnlocked ? (
                                                <div
                                                    className='flex justify-center items-center w-[30px] h-[30px] cursor-pointer group'
                                                    onClick={() => unlockAchievement(appId, item.name, false)}
                                                >
                                                    <FaLock className='text-red-400 group-hover:opacity-80 duration-200' />
                                                </div>
                                            ) : (
                                                <div
                                                    className='flex justify-center items-center w-[30px] h-[30px] cursor-pointer group'
                                                    onClick={() => unlockAchievement(appId, item.name, false)}
                                                >
                                                    <FaUnlockAlt className='text-green-400 group-hover:opacity-80 duration-200' />
                                                </div>
                                            )}
                                        </div>
                                        <div className='p-1'>
                                            <div className='w-full bg-titlehover rounded-full h-2.5 mb-1'>
                                                <div className='bg-sgi h-2.5 rounded-full' style={{ width: `${percentage}%` }}></div>
                                            </div>
                                            <p className='text-xs text-right'>{percentage.toFixed(1)}% unlock rate</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer toastStyle={{ fontSize: 12 }} position='bottom-right' theme={theme} transition={Slide} pauseOnFocusLoss={false} pauseOnHover={false} autoClose={5000} />
        </React.Fragment>
    );
}