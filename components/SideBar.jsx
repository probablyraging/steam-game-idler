import React from 'react';
import { motion } from 'framer-motion';
import { FaAward, FaSignOutAlt } from 'react-icons/fa';
import { IoGameController, IoSettings } from 'react-icons/io5';
import { logEvent } from '@/utils/utils';

export default function SideBar({ setUserSummary, activePage, setActivePage }) {
    const handleLogout = () => {
        setUserSummary(null);
        localStorage.removeItem('userSummary');
        localStorage.removeItem('favorites');
        localStorage.removeItem('cardFarming');
        localStorage.removeItem('achievementUnlocker');
        localStorage.removeItem('steamCookies');
        sessionStorage.removeItem('gamesListCache');
        logEvent('[System] Logged out');
    };

    return (
        <React.Fragment>
            <div className='flex justify-between flex-col w-[62px] min-h-calc max-h-calc bg-sidebar dark:bg-titlebar'>
                <div className='flex justify-center items-center flex-col'>
                    <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi dark:hover:bg-titlehover cursor-pointer' onClick={() => setActivePage('games')}>
                        {activePage === 'games' && (
                            <motion.div
                                className='absolute w-full border-r-4 border-white'
                                initial={{ height: 0 }}
                                whileInView={{ height: 30 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 350,
                                    damping: 18,
                                }}
                            />
                        )}
                        <IoGameController className='text-offwhite' fontSize={24} />
                    </div>
                    <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi dark:hover:bg-titlehover cursor-pointer' onClick={() => setActivePage('achievements')}>
                        {activePage === 'achievements' && (
                            <motion.div
                                className='absolute w-full border-r-4 border-white'
                                initial={{ height: 0 }}
                                whileInView={{ height: 30 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 350,
                                    damping: 18,
                                }}
                            />
                        )}
                        <FaAward className='text-offwhite' fontSize={24} />
                    </div>
                </div>

                <div className='flex flex-col justify-center items-center'>
                    <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi dark:hover:bg-titlehover cursor-pointer' onClick={() => setActivePage('settings')}>
                        {activePage === 'settings' && (
                            <motion.div
                                className='absolute w-full border-r-4 border-white'
                                initial={{ height: 0 }}
                                whileInView={{ height: 30 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 350,
                                    damping: 18,
                                }}
                            />
                        )}
                        <IoSettings className='text-offwhite' fontSize={24} />
                    </div>
                    <div className='flex justify-center items-center w-full h-[62px] hover:bg-red-500 cursor-pointer' onClick={handleLogout}>
                        <FaSignOutAlt className='text-offwhite rotate-180' fontSize={24} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}