import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ThemeSwitch from './theme/ThemeSwitch';
import { Button, Divider, Input } from '@nextui-org/react';
import { BiCoffeeTogo, BiSolidLeaf } from 'react-icons/bi';
import { HiMiniMinus } from 'react-icons/hi2';
import { BiWindows } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';
import { RiSearchLine } from 'react-icons/ri';
import Link from 'next/link';

export default function Header({ userSummary, inputValue, setInputValue, setIsQuery }) {
    const [appWindow, setAppWindow] = useState();

    async function setupAppWindow() {
        const appWindow = (await import('@tauri-apps/api/window')).appWindow;
        setAppWindow(appWindow);
    };

    useEffect(() => {
        setupAppWindow();
    }, []);

    const windowMinimize = () => {
        appWindow?.minimize();
    };

    const windowToggleMaximize = () => {
        appWindow?.toggleMaximize();
    };

    const windowClose = () => {
        appWindow?.close();
    };

    const handleQuery = () => {
        setIsQuery(true);
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = () => {
        handleQuery('query');
    };

    return (
        <React.Fragment>
            <div className='relative w-full h-[62px] bg-titlebar rounded-tr-lg rounded-tl-lg select-none'>
                <div className='flex justify-between items-center h-full text-titletext'>
                    <div className='flex justify-center items-center gap-1 px-2 bg-sgi h-full w-[62px] rounded-tl-lg'>
                        <BiSolidLeaf className='text-white' fontSize={40} />
                    </div>

                    <div className='flex justify-center items-center flex-grow h-full border-b border-titleborder'>
                        <div className='flex flex-grow p-4' data-tauri-drag-region>
                            <Input
                                placeholder='Search for a game'
                                startContent={<RiSearchLine />}
                                className='max-w-[400px]'
                                classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                                value={inputValue}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <Link href={'https://buymeacoffee.com/probablyraging'} target='_blank'>
                            <Button size='sm' className='bg-yellow-300'>
                                <p className='flex items-center gap-2 font-medium text-black'>
                                    <BiCoffeeTogo fontSize={18} /> Buy Me A Coffee
                                </p>
                            </Button>
                        </Link>

                        <Divider className='w-[1px] h-full bg-titleborder mx-2' />

                        <div className='flex items-center gap-2 h-full'>
                            <ThemeSwitch />
                            <div className='flex items-center gap-2 h-full p-2'>
                                <div className='text-end'>
                                    <p className='font-medium'>
                                        {userSummary.personaName}
                                    </p>
                                    <p className='text-xs text-neutral-400'>
                                        {userSummary.steamId}
                                    </p>
                                </div>
                                <Image src={userSummary.avatar} height={40} width={40} alt='user avatar' className='w-[40px] h-[40px] rounded-full' />
                            </div>
                        </div>

                        <Divider className='w-[1px] h-full bg-titleborder mx-2' />

                        <div className='flex justify-center items-center h-full'>
                            <div className='flex justify-center items-center hover:bg-titlehover w-[28px] h-full cursor-pointer' onClick={windowMinimize}>
                                <HiMiniMinus />
                            </div>
                            <div className='flex justify-center items-center hover:bg-titlehover w-[28px] h-full cursor-pointer' onClick={windowToggleMaximize}>
                                <BiWindows fontSize={12} />
                            </div>
                            <div className='flex justify-center items-center hover:bg-red-500 w-[28px] h-full rounded-tr-lg cursor-pointer' onClick={windowClose}>
                                <IoClose />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}