import React, { useEffect, useState } from 'react';
import { useTheme } from "next-themes";
import { LuMoonStar } from "react-icons/lu";
import { LuSun } from "react-icons/lu";
import { HiMiniComputerDesktop } from "react-icons/hi2";

export default function ThemeSwitch() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const handleClick = (mode) => {
        if (mode === 'dark') {
            setTheme('dark');
        } else if (mode === 'light') {
            setTheme('light');
        } else {
            setTheme('system');
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <React.Fragment>
            <div className='flex justify-center items-center cursor-pointer h-full'>
                <div className='flex items-center p-2 hover:bg-titlehover h-full' onClick={() => handleClick('dark')}>
                    <LuMoonStar fontSize={14} className={`${theme === 'dark' ? 'text-sgi' : 'text-titletext'}`} />
                </div>
                <div className='flex items-center p-2 hover:bg-titlehover h-full' onClick={() => handleClick('light')}>
                    <LuSun fontSize={14} className={`${theme === 'light' ? 'text-sgi' : 'text-titletext'}`} />
                </div>
                <div className='flex items-center p-2 hover:bg-titlehover h-full' onClick={() => handleClick('system')}>
                    <HiMiniComputerDesktop fontSize={14} className={`${theme === 'system' ? 'text-sgi' : 'text-titletext'}`} />
                </div>
            </div>
        </React.Fragment>
    )
}