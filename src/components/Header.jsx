import React from 'react';
import Image from 'next/image';
import ThemeSwitch from './theme/ThemeSwitch';
import { Input } from '@nextui-org/react';
import { BiSolidLeaf } from "react-icons/bi";
import { RiSearchLine } from "react-icons/ri";

export default function Header({ userSummary, inputValue, setInputValue, setIsQuery }) {
    const handleQuery = () => {
        setIsQuery(true);
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        handleQuery('query');
    };

    return (
        <React.Fragment>
            <div className='relative w-full h-[62px] bg-titlebar select-none'>
                <div className='flex justify-between items-center h-full text-titletext'>
                    <div className='flex justify-center items-center gap-1 px-2 bg-sgi h-full w-[62px]'>
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
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}