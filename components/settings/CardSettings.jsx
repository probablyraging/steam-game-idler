import React, { useEffect, useState } from 'react';
import ExtLink from '../ExtLink';
import { Button, Input, Skeleton } from '@nextui-org/react';
import { logEvent } from '@/utils/utils';

export default function CardSettings() {
    let [isLoading, setIsLoading] = useState(false);
    const [sidValue, setSidValue] = useState('');
    const [slsValue, setSlsValue] = useState('');
    const [hasCookies, setHasCookies] = useState(false);
    const [loginState, setLoginState] = useState(false);
    const [steamUser, setSteamUser] = useState(null);
    const [validationError, setValidationError] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const cookies = JSON.parse(localStorage.getItem('steamCookies'));
        if (cookies && cookies.sid && cookies.sls) {
            setHasCookies(true);
            setSidValue(cookies.sid);
            setSlsValue(cookies.sls);

            fetch('https://steeeam.vercel.app/api/ext-validate-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { sid: cookies.sid, sls: cookies.sls } }),
            }).then(async (res) => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setSteamUser(data.steamUser);
                    setLoginState(true);
                    logEvent(`[Settings - Card Farming] Logged in as ${data.steamUser}`);
                } else {
                    setValidationError(true);
                    logEvent('[Error] Incorrect \'Card Farming\' credentials');
                }
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleSidChange = (e) => {
        setSidValue(e.target.value);
    };

    const handleSlsChange = (e) => {
        setSlsValue(e.target.value);
    };

    const handleSave = async () => {
        if (sidValue.length > 0 && slsValue.length > 0) {
            setIsLoading(true);

            fetch('https://steeeam.vercel.app/api/ext-validate-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { sid: sidValue, sls: slsValue } }),
            }).then(async (res) => {
                if (res.status !== 500) {
                    const data = await res.json();
                    setSteamUser(data.steamUser);
                    setLoginState(true);
                    localStorage.setItem('steamCookies', JSON.stringify({ sid: sidValue, sls: slsValue }));
                    setHasCookies(true);
                    logEvent(`[Settings - Card Farming] Logged in as ${data.steamUser}`);
                } else {
                    setValidationError(true);
                    logEvent('[Error] Incorrect \'Card Farming\' credentials');
                    setTimeout(() => {
                        setValidationError(false);
                    }, 4000);
                }
                setIsLoading(false);
            });
        }
    };

    const handleClear = async () => {
        localStorage.removeItem('steamCookies');
        setSidValue('');
        setSlsValue('');
        setLoginState(false);
        setHasCookies(false);
        logEvent('[Settings - Card Farming] Logged out');
    };

    return (
        <React.Fragment>
            <div className='mt-4 p-4 border border-border rounded'>
                <p className='text-sm font-semibold mb-6'>
                    Card Farming
                </p>

                <div className='flex flex-col gap-6'>
                    <div className='w-full'>
                        <div className='flex flex-col'>
                            <p className='text-xs mb-2'>
                                Steam credentials are required in order to use the Card Farming feature. <ExtLink href={'https://github.com/probablyraging/steam-game-idler/wiki/Settings#steam-credentials'} className='text-blue-400'>Learn more</ExtLink>
                            </p>

                            <div className='flex gap-4'>
                                <Input
                                    size='sm'
                                    placeholder='sessionid'
                                    className='max-w-[200px]'
                                    classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                                    value={sidValue}
                                    onChange={handleSidChange}
                                />
                                <Input
                                    size='sm'
                                    placeholder='steamLoginSecure'
                                    className='max-w-[200px]'
                                    classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                                    value={slsValue}
                                    onChange={handleSlsChange}
                                />
                                <Button isDisabled={hasCookies || !sidValue || !slsValue} size='sm' className='bg-sgi font-semibold text-white rounded-sm' onClick={handleSave}>
                                    Save
                                </Button>
                                <Button isDisabled={!hasCookies} size='sm' className='font-semibold text-white bg-red-400 rounded-sm' onClick={handleClear}>
                                    Clear
                                </Button>
                            </div>

                            <div className='mt-2'>
                                {isLoading ? (
                                    <div className='flex py-1 h-[16px]'>
                                        <Skeleton className='w-[70px] h-[8px] rounded' />
                                    </div>
                                ) : (
                                    <React.Fragment>
                                        {loginState ? (
                                            <p className='text-xs text-green-400' >
                                                Logged in as {steamUser}
                                            </p>
                                        ) : (
                                            <React.Fragment>
                                                {validationError ? (
                                                    <p className='text-xs text-red-400'>
                                                        Incorrect credentials
                                                    </p>
                                                ) : (
                                                    <p className='text-xs text-red-400'>
                                                        Not logged in
                                                    </p>
                                                )}
                                            </React.Fragment>
                                        )}
                                    </React.Fragment>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}