import React from 'react';
import Image from 'next/image';
import { unlockAchievement } from '@/utils/utils';

export default function AchievementsList({ appId, achievementsUnavailable, achievementList, userAchievementsMap, percentageMap }) {
    return (
        <React.Fragment>
            <div className='grid grid-cols-1 gap-4 max-h-[430px] pr-2 w-full overflow-y-auto'>
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
                                    <div className='w-full'>
                                        <p className='text-xs text-gray-600 dark:text-gray-400'>{item.description || 'Hidden achievement'}</p>
                                    </div>
                                </div>
                                {isUnlocked ? (
                                    <div
                                        className='flex justify-center items-center w-[30px] h-[30px] cursor-pointer group'
                                        onClick={() => unlockAchievement(appId, item.name, false)}
                                    >
                                        <div className='bg-red-400 group-hover:bg-opacity-85 py-1 px-2 rounded-sm text-xs text-offwhite font-semibold mr-6 duration-200'>
                                            <p>Lock</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className='flex justify-center items-center w-[30px] h-[30px] cursor-pointer group'
                                        onClick={() => unlockAchievement(appId, item.name, false)}
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