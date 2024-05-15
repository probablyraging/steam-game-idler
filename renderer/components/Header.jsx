import React from 'react';
import Image from 'next/image';
import { Button } from '@nextui-org/react';
import Status from './Status';
import ThemeSwitch from './theme/ThemeSwitch';

export default function Header({ userSummary, setUserSummary }) {
    const handleLogout = () => {
        setUserSummary(null);
        localStorage.setItem('userSummary', null);
    };

    return (
        <div className='fixed flex justify-between items-center w-full bg-base border-b border-light-border p-2 z-50'>
            <div className='flex items-center gap-2'>
                <Image
                    className='border border-neutral-200 dark:border-neutral-700 rounded-full w-[40px] h-[40px]'
                    src={userSummary.avatar}
                    width={64}
                    height={64}
                    alt='avatar'
                />

                <div className='flex flex-col'>
                    <p className='text-lg font-medium'>
                        {userSummary.personaName}
                    </p>
                    <p className='text-xs text-dull'>
                        {userSummary.steamId}
                    </p>
                </div>
            </div>

            <div>
                <Status />
            </div>

            <div className='flex items-center gap-6'>
                <ThemeSwitch />
                <Button className='font-medium bg-pop text-white dark:text-black rounded' size='sm' onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </div>
    )
}