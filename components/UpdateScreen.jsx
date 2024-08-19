import React, { useEffect, useState } from 'react';
import { installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import { Progress, Spinner } from '@nextui-org/react';
import { HiMiniMinus } from 'react-icons/hi2';
import { BiSolidLeaf, BiWindows } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';

export default function UpdateScreen() {
    const [progress, setProgress] = useState(0);
    const [appWindow, setAppWindow] = useState();
    const [checkUpdate, setCheckUpdate] = useState(true);

    useEffect(() => {
        const performUpdate = async () => {
            setTimeout(async () => {
                setCheckUpdate(false);
                await installUpdate();
                await relaunch();
            }, 2000);
        };
        performUpdate();
    }, []);

    useEffect(() => {
        const progressInt = setInterval(() => {
            setProgress((prevValue) => {
                if (prevValue >= 100) {
                    clearInterval(progressInt);
                    return prevValue;
                }
                return prevValue + 10;
            });
        }, 100);
        return () => clearInterval(progressInt);
    }, []);

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

    return (
        <React.Fragment>
            <div className='flex justify-between items-center w-screen h-[30px] bg-sgi rounded-tr-lg rounded-tl-lg' data-tauri-drag-region>
                <div className='flex items-center gap-1 px-2 bg-sgi h-full w-[62px] rounded-tl-lg'>
                    <BiSolidLeaf className='text-white' fontSize={20} />
                </div>
                <div className='flex justify-center items-center h-full ml-2'>
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
            <div className='flex justify-center items-center flex-col gap-2 w-screen h-screen'>
                {checkUpdate ? (
                    <React.Fragment>
                        <p className='text-sm font-semibold'>
                            Checking for updates
                        </p>
                        <Spinner />
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <p className='text-sm font-semibold'>
                            Installing updates..
                        </p>
                        <Progress aria-label='progress-bar' color='secondary' size='sm' value={progress} className='w-1/2' />
                    </React.Fragment>
                )}
            </div>
        </React.Fragment>
    );
}