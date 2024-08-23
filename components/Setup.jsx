import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import TitleBar from './TitleBar';
import ExtLink from './ExtLink';
import { invoke } from '@tauri-apps/api/tauri';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Setup({ setUserSummary }) {
    const [isLoading, setIsLoading] = useState(false);
    const [steamId, setSteamId] = useState(null);

    useEffect(() => {
        if (steamId) {
            fetch('https://apibase.vercel.app/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-summary', uid: steamId }),
            }).then(async res => {
                if (res.status !== 500) {
                    setIsLoading(false);
                    const userSummary = await res.json();
                    localStorage.setItem('userSummary', JSON.stringify(userSummary));
                    setUserSummary(userSummary);
                }
            });
        }
    }, [steamId]);

    const handleClick = async () => {
        setIsLoading(true);
        const path = await invoke('get_file_path');
        const fullPath = path.replace('Steam Game Idler.exe', 'libs\\SteamUtility.exe');
        const result = await invoke('check_steam_status', { filePath: fullPath });
        if (result === 'not_running') {
            setIsLoading(false);
            return toast.error('The Steam desktop app is not running, or you are not signed in');
        } else {
            setSteamId(result);
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
                        <Image src={'/logo.webp'} width={32} height={32} alt='logo' priority={false} />
                        <p className='text-4xl'>
                            Welcome
                        </p>
                    </div>

                    <div className='flex justify-center items-center flex-col gap-5 pb-6'>
                        <Button
                            isLoading={isLoading}
                            size='sm'
                            className='bg-sgi text-offwhite font-semibold rounded-sm'
                            onClick={handleClick}
                        >
                            Continue
                        </Button>
                    </div>

                    <div className='flex justify-center items-center p-6 w-full bg-[#f6f6f6] dark:bg-[#181818] border-t border-border rounded-br-lg rounded-bl-lg'>
                        <ExtLink href={'https://github.com/probablyraging/steam-game-idler/wiki/User-interface#welcome-screen'}>
                            <p className='text-xs text-link hover:text-linkhover cursor-pointer'>
                                Need help?
                            </p>
                        </ExtLink>
                    </div>
                </motion.div>
            </div>
            <ToastContainer toastStyle={{ fontSize: 12 }} position='bottom-right' theme='dark' transition={Slide} pauseOnFocusLoss={false} pauseOnHover={false} autoClose={5000} />
        </React.Fragment >
    );
}