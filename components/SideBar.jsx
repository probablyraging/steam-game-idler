import React from 'react';
import { motion } from 'framer-motion';
import { TbSortAZ, TbSortZA } from 'react-icons/tb';
import { MdOutlineTimer10Select, MdOutlineTimer3Select } from 'react-icons/md';
import { MdAvTimer } from 'react-icons/md';
import { TiHeartFullOutline } from 'react-icons/ti';
import { FaSignOutAlt } from 'react-icons/fa';
import { Tooltip } from '@nextui-org/react';

export default function SideBar({ setUserSummary, sortStyle, setSortStyle }) {
    const handleLogout = () => {
        setUserSummary(null);
        localStorage.setItem('userSummary', null);
    };

    return (
        <React.Fragment>
            <div className='flex justify-between flex-col w-[62px] min-h-calc max-h-calc bg-sidebar'>
                <div className='flex justify-center items-center flex-col'>
                    <Tooltip closeDelay={0} placement='left' offset={-7} className='text-xs font-bold' content='Alphabetically Ascending'>
                        <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi cursor-pointer' onClick={() => setSortStyle('a-z')}>
                            {sortStyle === 'a-z' && (
                                <motion.div
                                    className='absolute w-full border-r-4 border-white'
                                    initial={{ height: 0 }}
                                    whileInView={{ height: 30 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 350,
                                        damping: 18,
                                    }}
                                ></motion.div>
                            )}
                            <TbSortAZ className='text-white' fontSize={32} />
                        </div>
                    </Tooltip>
                    <Tooltip closeDelay={0} placement='left' offset={-7} className='text-xs font-bold' content='Alphabetically Descending'>
                        <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi cursor-pointer' onClick={() => setSortStyle('z-a')}>
                            {sortStyle === 'z-a' && (
                                <motion.div
                                    className='absolute w-full border-r-4 border-white'
                                    initial={{ height: 0 }}
                                    whileInView={{ height: 30 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 350,
                                        damping: 18,
                                    }}
                                ></motion.div>
                            )}
                            <TbSortZA className='text-white' fontSize={32} />
                        </div>
                    </Tooltip>
                    <Tooltip closeDelay={0} placement='left' offset={-7} className='text-xs font-bold' content='Playtime High to Low'>
                        <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi cursor-pointer' onClick={() => setSortStyle('1-0')}>
                            {sortStyle === '1-0' && (
                                <motion.div
                                    className='absolute w-full border-r-4 border-white'
                                    initial={{ height: 0 }}
                                    whileInView={{ height: 30 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 350,
                                        damping: 18,
                                    }}
                                ></motion.div>
                            )}
                            <MdOutlineTimer10Select className='text-white' fontSize={24} />
                        </div>
                    </Tooltip>
                    <Tooltip closeDelay={0} placement='left' offset={-7} className='text-xs font-bold' content='Playtime Low to High'>
                        <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi cursor-pointer' onClick={() => setSortStyle('0-1')}>
                            {sortStyle === '0-1' && (
                                <motion.div
                                    className='absolute w-full border-r-4 border-white'
                                    initial={{ height: 0 }}
                                    whileInView={{ height: 30 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 350,
                                        damping: 18,
                                    }}
                                ></motion.div>
                            )}
                            <MdOutlineTimer3Select className='text-white' fontSize={24} />
                        </div>
                    </Tooltip>
                    <Tooltip closeDelay={0} placement='left' offset={-7} className='text-xs font-bold' content='Recently Played'>
                        <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi cursor-pointer' onClick={() => setSortStyle('recent')}>
                            {sortStyle === 'recent' && (
                                <motion.div
                                    className='absolute w-full border-r-4 border-white'
                                    initial={{ height: 0 }}
                                    whileInView={{ height: 30 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 350,
                                        damping: 18,
                                    }}
                                ></motion.div>
                            )}
                            <MdAvTimer className='text-white' fontSize={24} />
                        </div>
                    </Tooltip>
                    <Tooltip closeDelay={0} placement='left' offset={-7} className='text-xs font-bold' content='Favorited'>
                        <div className='relative flex justify-center items-center w-full h-[62px] hover:bg-sgi cursor-pointer' onClick={() => setSortStyle('fav')}>
                            {sortStyle === 'fav' && (
                                <motion.div
                                    className='absolute w-full border-r-4 border-white'
                                    initial={{ height: 0 }}
                                    whileInView={{ height: 30 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 350,
                                        damping: 18,
                                    }}
                                ></motion.div>
                            )}
                            <TiHeartFullOutline className='text-white' fontSize={24} />
                        </div>
                    </Tooltip>
                </div>

                <div className='flex justify-center items-center'>
                    <Tooltip closeDelay={0} placement='left' offset={-7} className='text-xs font-bold' content='Logout'>
                        <div className='flex justify-center items-center w-full h-[62px] hover:bg-red-500 cursor-pointer' onClick={handleLogout}>
                            <FaSignOutAlt className='text-white rotate-180' fontSize={24} />
                        </div>
                    </Tooltip>
                </div>
            </div>
        </React.Fragment>
    );
}