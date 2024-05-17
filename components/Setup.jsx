import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button, Input, Tooltip } from '@nextui-org/react';
import { FiHash } from "react-icons/fi";
import TitleBar from './TitleBar';

export default function Setup({ setUserSummary }) {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const verify = (uid) => {
        setIsLoading(true);

        fetch(`https://steeeam.vercel.app/api/ext-user-summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { uid: uid } }),
        }).then(async res => {
            if (res.status !== 500) {
                const userSummary = await res.json()
                localStorage.setItem('userSummary', JSON.stringify(userSummary));
                setUserSummary(userSummary);
                setIsLoading(false);
            } else {
                setError(<p className='text-red-400'>Incorrect Steam username or ID64</p>);
                setIsLoading(false);
                setTimeout(() => {
                    setError(null);
                }, 3000);
            }
        });
    };

    const handleSubmit = async (e) => {
        if (inputValue.length > 0) {
            verify(inputValue);
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
            <TitleBar />

            <div className='flex justify-center items-center flex-col gap-5 w-full min-h-calc'>
                <motion.div
                    className='flex justify-center items-center flex-col border border-border min-w-[400px] max-w-[400px] rounded-lg shadow-soft-lg dark:shadow-none'
                    initial={{ y: 500 }}
                    animate={{ y: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 23,
                    }}
                >
                    <div className='flex items-center flex-col gap-2 p-6'>
                        <Image src={'/logo.png'} width={32} height={32} alt='logo' />
                        <p className='text-4xl'>
                            Welcome
                        </p>
                    </div>

                    <div className='flex justify-center items-center flex-col gap-5 pb-6'>
                        <Input
                            placeholder='Steam username or ID64'
                            startContent={<FiHash />}
                            value={inputValue}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            description={error}
                            classNames={{
                                inputWrapper: ['bg-base border border-inputborder hover:!bg-titlebar']
                            }}
                        />
                        <Button
                            size='sm'
                            color='primary'
                            className='font-medium rounded-sm'
                            isLoading={isLoading}
                            onClick={handleSubmit}
                        >
                            Continue
                        </Button>
                    </div>

                    <div className='flex justify-center items-center p-6 w-full bg-[#f6f6f6] dark:bg-[#181818] border-t border-border rounded-br-lg rounded-bl-lg'>
                        <Tooltip closeDelay={0} className='text-xs' content='Your username or SteamID64 is needed in order to pull your games list from the Steam API'>
                            <p className='text-xs text-link hover:text-linkhover cursor-pointer'>
                                Why do you need this?
                            </p>
                        </Tooltip>
                    </div>
                </motion.div>
            </div>
        </React.Fragment >
    )
}