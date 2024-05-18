import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { GeistSans } from 'geist/font/sans';
import { invoke } from '@tauri-apps/api/tauri';
import ThemeSwitch from '@/components/theme/ThemeSwitch';
import { Button, Divider, Input } from '@nextui-org/react';
import { BiSolidLeaf } from "react-icons/bi";
import { HiMiniMinus } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";

export default function index() {
    const [appWindow, setAppWindow] = useState();
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('You can idle multiple games (e.g. 460, 22100, 5749)');

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

    const windowClose = () => {
        appWindow?.close();
    };

    const handleSubmit = async (e) => {
        if (inputValue.length > 0) {
            const status = await invoke('check_status');
            if (!status) {
                setError(<p className='text-red-400'>Steam is not running. Open Steam and try again!</p>);
                return setTimeout(() => {
                    setError('You can idle multiple games (e.g. 460, 22100, 5749)');
                }, 6000);
            }

            const appIds = inputValue.split(',').map(id => id.trim());
            for (const appId of appIds) {
                const path = await invoke('get_file_path');
                const fullPath = path.replace('Steam Game Idler Lite.exe', 'lib\\steam-idle.exe');
                await invoke('idle_game', { filePath: fullPath, argument: appId.toString() });
            }
            setInputValue('');
        }
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <React.Fragment>
            <Head>
                <title>Steam Game Idler Lite</title>
            </Head>

            <main className={`${GeistSans.className} h-full min-h-screen bg-base rounded-lg`}>
                <div className='bg-base min-h-screen max-h-[calc(100vh-62px)] rounded-lg'>
                    <div className='relative w-full h-[100px] bg-titlebar rounded-lg select-none'>
                        <div className='flex justify-between items-center h-full text-titletext'>
                            <div className='flex justify-center items-center gap-1 px-2 bg-sgi h-full w-[62px] rounded-tl-lg rounded-bl-lg'>
                                <BiSolidLeaf className='text-white' fontSize={40} />
                            </div>

                            <div className='flex justify-center items-center flex-grow h-full'>
                                <div className='flex flex-grow p-4' data-tauri-drag-region>
                                    <Input
                                        label='Enter one or more game IDs'
                                        description={error}
                                        endContent={
                                            <Button
                                                size='sm'
                                                isIconOnly
                                                isDisabled={!inputValue > 0}
                                                startContent={<FaArrowRight />}
                                                onClick={handleSubmit}
                                                className='bg-sgi text-white ml-[20px]'
                                            />
                                        }
                                        className='max-w-[400px]'
                                        classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                                        value={inputValue}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>

                                <div className='flex items-center gap-2 h-full'>
                                    <ThemeSwitch />
                                </div>

                                <Divider className='w-[1px] h-full bg-titleborder mx-2' />


                                <div className='flex justify-center items-center h-full'>
                                    <div className='flex justify-center items-center hover:bg-titlehover w-[28px] h-full cursor-pointer' onClick={windowMinimize}>
                                        <HiMiniMinus />
                                    </div>
                                    <div className='flex justify-center items-center hover:bg-red-500 w-[28px] h-full rounded-tr-lg rounded-br-lg cursor-pointer' onClick={windowClose}>
                                        <IoClose />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </React.Fragment>
    )
}