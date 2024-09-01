import React from 'react';
import Image from 'next/image';
import { unlockAchievement } from '@/utils/utils';
import { toast } from 'react-toastify';
import { Tooltip } from '@nextui-org/react';

export default function AchievementsList({ appId, appName, achievementsUnavailable, achievementList, userGameAchievementsMap, percentageMap }) {
    const handleUnlock = async (achievementName, type) => {
        const status = await unlockAchievement(appId, achievementName, false);
        if (!status.error) {
            toast.success(`${type} ${achievementName} for ${appName}`, { autoClose: 1500 });
        } else {
            toast.error(`Error: ${status.error}`);
        }
    };

    return (
        <React.Fragment>
            <div className='grid grid-cols-1 gap-4 w-full pr-2 max-h-[calc(100vh-270px)] overflow-y-auto scroll-smooth p-2'>
                {achievementsUnavailable && (
                    <div className='flex justify-center items-center w-full'>
                        <p className='text-xs'>
                            No achievements found
                        </p>
                    </div>
                )}
                {achievementList && achievementList.map((item) => {
                    const isUnlocked = userGameAchievementsMap.get(item.name) || false;
                    const percentage = percentageMap.get(item.name);

                    return (
                        <div key={item.name} className='flex flex-col bg-container border border-border rounded shadow-sm'>
                            <div className='flex items-center p-3 bg-base'>
                                <Image
                                    className='rounded-full mr-3'
                                    src={isUnlocked ? item.icon : item.icongray}
                                    width={40}
                                    height={40}
                                    alt={`${item.name} image`}
                                />
                                <div className='flex flex-col w-full'>
                                    <Tooltip size='sm' closeDelay={0} content={<p className='font-semibold'>{item.name}</p>}>
                                        <p className='font-bold text-xs w-fit'>
                                            {item.displayName}
                                        </p>
                                    </Tooltip>
                                    <div className='w-full'>
                                        <p className='text-xs text-gray-600 dark:text-gray-400'>{item.description || 'Hidden achievement'}</p>
                                    </div>
                                </div>
                                {isUnlocked ? (
                                    <div
                                        className='flex justify-center items-center w-[30px] h-[30px] cursor-pointer group'
                                        onClick={() => handleUnlock(item.name, 'Locked')}
                                    >
                                        <div className='bg-red-400 group-hover:bg-opacity-85 py-1 px-2 rounded-sm text-xs text-offwhite font-semibold mr-6 duration-200'>
                                            <p>Lock</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className='flex justify-center items-center w-[30px] h-[30px] cursor-pointer group'
                                        onClick={() => handleUnlock(item.name, 'Unlocked')}
                                    >
                                        <div className='bg-[#4fc27d] group-hover:bg-opacity-85 py-1 px-2 rounded-sm text-xs text-offwhite font-semibold mr-6 duration-200'>
                                            <p>Unlock</p>
                                        </div>
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
        </React.Fragment>
    );
}