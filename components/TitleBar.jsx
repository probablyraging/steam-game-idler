import React, { useState, useEffect } from 'react';
import ThemeSwitch from './theme/ThemeSwitch';
import { BiSolidLeaf } from 'react-icons/bi';
import { HiMiniMinus } from 'react-icons/hi2';
import { BiWindows } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';

export default function TitleBar() {
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

    return (
        <React.Fragment>
            <div className='h-[62px] bg-titlebar border-b border-titleborder rounded-tr-[10px] rounded-tl-xl select-none'>
                <div className='flex justify-between items-center h-full text-titletext' data-tauri-drag-region>
                    <div className='flex justify-center items-center gap-1 px-2 bg-sgi h-full w-[62px] rounded-tl-[10px]'>
                        <BiSolidLeaf className='text-offwhite' fontSize={40} />
                    </div>

                    <div className='flex justify-center items-center h-full'>
                        <div className='flex items-center gap-2 h-full'>
                            <ThemeSwitch />
                        </div>

                        <div className='flex justify-center items-center h-full ml-2'>
                            <div className='flex justify-center items-center hover:bg-titlehover w-[28px] h-full cursor-pointer' onClick={windowMinimize}>
                                <HiMiniMinus />
                            </div>
                            <div className='flex justify-center items-center hover:bg-titlehover w-[28px] h-full cursor-pointer' onClick={windowToggleMaximize}>
                                <BiWindows fontSize={12} />
                            </div>
                            <div className='flex justify-center items-center hover:bg-red-500 w-[28px] h-full rounded-tr-xl cursor-pointer' onClick={windowClose}>
                                <IoClose />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}