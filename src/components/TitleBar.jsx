import React from 'react';
import ThemeSwitch from './theme/ThemeSwitch';
import { BiSolidLeaf } from "react-icons/bi";

export default function TitleBar() {
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
            <div className='h-[62px] bg-titlebar border-b border-titleborder select-none'>
                <div className='flex justify-between items-center h-full text-titletext' data-tauri-drag-region>
                    <div className='flex justify-center items-center gap-1 px-2 bg-sgi h-full w-[62px]'>
                        <BiSolidLeaf className='text-white' fontSize={40} />
                    </div>

                    <div className='flex justify-center items-center h-full'>
                        <div className='flex items-center gap-2 h-full'>
                            <ThemeSwitch />
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}