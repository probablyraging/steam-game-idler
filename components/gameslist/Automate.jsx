import React from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { IoPlay, IoSettings } from 'react-icons/io5';
import { IoGameController } from 'react-icons/io5';
import { FaAward } from 'react-icons/fa';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { invoke } from '@tauri-apps/api/tauri';

export default function Automate({ setActivePage }) {
    const startCardFarming = async () => {
        const steamRunning = await invoke('check_status');
        const steamCookies = JSON.parse(localStorage.getItem('steamCookies')) || {};
        const settings = JSON.parse(localStorage.getItem('settings')) || {};
        if (!steamRunning) {
            return toast.error('Steam is not running');
        }
        if (!steamCookies.sid || !steamCookies.sls) {
            return toast.error('Missing credentials in Settings');
        }
        const response = await fetch('https://apibase.vercel.app/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'validate-session', sid: steamCookies?.sid, sls: steamCookies?.sls }),
        });
        if (response.status === 500) {
            localStorage.removeItem('steamCookies');
            return toast.error('Steam credentials need to be updated');
        }
        const cardFarming = JSON.parse(localStorage.getItem('cardFarming')) || [];
        if (!settings.cardFarming.allGames && cardFarming.length < 1) {
            return toast.error('Enable the "All games" setting or add some games to your card farming list');
        }
        setActivePage('card-farming');
    };

    const startAchievementUnlocker = async () => {
        const steamRunning = await invoke('check_status');
        const settings = JSON.parse(localStorage.getItem('settings')) || {};
        if (!steamRunning) {
            return toast.error('Steam is not running');
        }
        if (!settings || Object.keys(settings).length < 1) {
            return toast.error('Please configure the settings first');
        }
        const achievementUnlocker = JSON.parse(localStorage.getItem('achievementUnlocker')) || [];
        if (achievementUnlocker.length < 1) {
            return toast.error('No games in achievement unlocker list');
        }
        setActivePage('achievement-unlocker');
    };

    return (
        <React.Fragment>
            <Dropdown classNames={{ content: ['rounded p-0'] }}>
                <DropdownTrigger>
                    <Button size='sm' className='bg-sgi rounded-full'>
                        <div className='flex items-center gap-1'>
                            <p className='font-semibold text-white'>
                                Automate
                            </p>
                            <IoPlay fontSize={18} color='white' />
                        </div>
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label='actions'>
                    <DropdownItem
                        className='rounded'
                        key='idle'
                        startContent={<IoGameController />}
                        onClick={startCardFarming}
                    >
                        Start card farming
                    </DropdownItem>
                    <DropdownItem
                        className='rounded'
                        key='achiements'
                        startContent={<FaAward />}
                        onClick={startAchievementUnlocker}
                    >
                        Start achievement unlocker
                    </DropdownItem>
                    <DropdownItem
                        className='rounded'
                        key='settings'
                        startContent={<IoSettings />}
                        onClick={() => setActivePage('settings')}
                    >
                        Change settings
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <ToastContainer toastStyle={{ fontSize: 12 }} position='bottom-right' theme='dark' transition={Slide} pauseOnFocusLoss={false} pauseOnHover={false} autoClose={5000} />
        </React.Fragment>
    );
}