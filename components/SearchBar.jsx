import React from 'react';
import { Input } from '@nextui-org/react';
import { RiSearchLine } from "react-icons/ri";

export default function SearchBar() {
    return (
        <React.Fragment>
            <div className='w-full border-b border-border'>
                <Input
                    placeholder='Search for a game'
                    startContent={<RiSearchLine />}
                    classNames={{
                        inputWrapper: ['rounded-none', 'bg-transparent', 'hover:!bg-titlebar']
                    }}
                />
            </div>
        </React.Fragment>
    )
}