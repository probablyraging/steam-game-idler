import React from 'react';
import { motion } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';
import { IoGameController, IoSettings } from 'react-icons/io5';
import { logEvent } from '@/utils/utils';

export default function SideBar({ setUserSummary, activePage, setActivePage }) {
    const handleLogout = () => {
        try {
            const settings = JSON.parse(localStorage.getItem('settings'));
            const { clearData } = settings?.general || {};
            setUserSummary(null);
            sessionStorage.removeItem('gamesListCache');
            localStorage.removeItem('userSummary');
            if (clearData) {
                localStorage.removeItem('steamCookies');
                localStorage.removeItem('favorites');
                localStorage.removeItem('cardFarming');
                localStorage.removeItem('achievementUnlocker');
            }
            logEvent('[System] Logged out');
        } catch (error) {
            console.error('Error in (handleLogout):', error);
            logEvent(`[Error] in (handleLogout): ${error}`);
        }
    };

    return (
        <React.Fragment>
            <div className='flex justify-between flex-col w-[62px] min-h-calc max-h-calc bg-sidebar dark:bg-titlebar'>
                <div className='flex justify-center items-center flex-col'>
                    <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi dark:hover:bg-titlehover cursor-pointer duration-200' onClick={() => setActivePage('games')}>
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
                </div>

                <div className='flex flex-col justify-end items-center h-full'>
                    <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi dark:hover:bg-titlehover cursor-pointer duration-200' onClick={() => setActivePage('settings')}>
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
                    <div className='flex justify-center items-center w-full h-[62px] hover:bg-red-500 cursor-pointer duration-200' onClick={handleLogout}>
                        <FaSignOutAlt className='text-offwhite rotate-180' fontSize={24} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}