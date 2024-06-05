import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Tooltip } from '@nextui-org/tooltip';
import TitleBar from './TitleBar';

export default function Setup({ setUserSummary }) {
    const [usernameValue, setUsernameValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [twoFactorValue, setTwoFactorValue] = useState('');
    const [requires2FA, setRequires2FA] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (usernameValue.length > 0 && passwordValue.length > 0) {
            setIsLoading(true);

            fetch('api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { username: usernameValue, password: passwordValue, authCode: twoFactorValue } }),
            }).then(async res => {
                if (res.status !== 500) {
                    const data = await res.json();

                    if (data.requires2FA) {
                        setRequires2FA(true);
                        setIsLoading(false);
                        return;
                    }

                    localStorage.setItem('steamAuth', JSON.stringify({ username: usernameValue, password: passwordValue }));

                    fetch('https://steeeam.vercel.app/api/ext-user-summary', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data: { uid: data.steamId } }),
                    }).then(async res => {
                        if (res.status !== 500) {
                            const userSummary = await res.json();
                            localStorage.setItem('userSummary', JSON.stringify(userSummary));
                            setUserSummary(userSummary);
                            setIsLoading(false);
                        } else {
                            setError(<p className='text-red-400'>Incorrect Steam username or Password</p>);
                            setIsLoading(false);
                            setTimeout(() => {
                                setError(null);
                            }, 3000);
                        }
                    });
                }
            });
        }
    };

    const handleUsernameChange = (e) => {
        setUsernameValue(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPasswordValue(e.target.value);
    };

    const handleTwoFactorChange = (e) => {
        setTwoFactorValue(e.target.value);
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
                        {!requires2FA && (
                            <React.Fragment>
                                <Input
                                    placeholder='Steam Username'
                                    isRequired
                                    value={usernameValue}
                                    onChange={handleUsernameChange}
                                    onKeyDown={handleKeyDown}
                                    description={error}
                                    classNames={{
                                        inputWrapper: ['bg-base border border-inputborder hover:!bg-titlebar']
                                    }}
                                />
                                <Input
                                    placeholder='Steam Password'
                                    isRequired
                                    type='password'
                                    value={passwordValue}
                                    onChange={handlePasswordChange}
                                    onKeyDown={handleKeyDown}
                                    description={error}
                                    classNames={{
                                        inputWrapper: ['bg-base border border-inputborder hover:!bg-titlebar']
                                    }}
                                />
                            </React.Fragment>
                        )}
                        {requires2FA && (
                            <Input
                                placeholder='Steam Guard Code'
                                isRequired
                                maxLength={5}
                                value={twoFactorValue}
                                onChange={handleTwoFactorChange}
                                onKeyDown={handleKeyDown}
                                description={error}
                                classNames={{
                                    inputWrapper: ['bg-base border border-inputborder hover:!bg-titlebar']
                                }}
                            />
                        )}
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
                        <Tooltip closeDelay={0} className='text-xs' content='Unfortunately the Web Server version of SGI requires Steam login details as the library it depends on (steam-user) requires it'>
                            <p className='text-xs text-link hover:text-linkhover cursor-pointer'>
                                Why do you need this?
                            </p>
                        </Tooltip>
                    </div>
                </motion.div>
            </div>
        </React.Fragment >
    );
}