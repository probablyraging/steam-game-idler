import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button, Input } from '@nextui-org/react';
import { FiHash } from 'react-icons/fi';
import TitleBar from './TitleBar';
import ExtLink from './ExtLink';

export default function Setup({ setUserSummary }) {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const verify = (uid) => {
        setIsLoading(true);

        fetch('https://steeeam.vercel.app/api/ext-user-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { uid: uid } }),
        }).then(async res => {
            if (res.status !== 500) {
                const userSummary = await res.json();
                localStorage.setItem('userSummary', JSON.stringify(userSummary));
                setUserSummary(userSummary);
                setIsLoading(false);
            } else {
                setError(<p className='text-red-400'>Incorrect Steam profile name or ID64</p>);
                setIsLoading(false);
                setTimeout(() => {
                    setError(null);
                }, 3000);
            }
        });
    };

    const handleSubmit = async () => {
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
                        <Image src={'/logo.webp'} width={32} height={32} alt='logo' />
                        <p className='text-4xl'>
                            Welcome
                        </p>
                    </div>

                    <div className='flex justify-center items-center flex-col gap-5 pb-6'>
                        <Input
                            placeholder='Steam profile name or ID64'
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
                            isDisabled={inputValue.length < 1}
                            size='sm'
                            className='bg-sgi text-white font-semibold rounded-sm'
                            isLoading={isLoading}
                            onClick={handleSubmit}
                        >
                            Continue
                        </Button>
                    </div>

                    <div className='flex justify-center items-center p-6 w-full bg-[#f6f6f6] dark:bg-[#181818] border-t border-border rounded-br-lg rounded-bl-lg'>
                        <ExtLink href={'https://github.com/probablyraging/steam-game-idler/wiki/User-interface#login-screen'}>
                            <p className='text-xs text-link hover:text-linkhover cursor-pointer'>
                                Why do you need this?
                            </p>
                        </ExtLink>
                    </div>
                </motion.div>
            </div>
        </React.Fragment >
    );
}