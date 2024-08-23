import React, { useEffect, useState } from 'react';
import ExtLink from '../ExtLink';
import CardSettings from './CardSettings';
import AchievementSettings from './AchievementSettings';
import Logs from './Logs';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { getVersion } from '@tauri-apps/api/app';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Tab, Tabs } from '@nextui-org/react';

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const [version, setVersion] = useState('v0.0.0');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const getAppVersion = async () => {
            const appVersion = await getVersion();
            setVersion(appVersion);
        };
        getAppVersion();
    }, []);

    useEffect(() => {
        const defaultSettings = {
            cardFarming: {
                listGames: true,
                allGames: false
            },
            achievementUnlocker: {
                interval: [30, 130],
                idle: false
            }
        };
        let currentSettings = JSON.parse(localStorage.getItem('settings')) || {};
        let updatedSettings = {
            cardFarming: {
                ...defaultSettings.cardFarming,
                ...currentSettings.cardFarming
            },
            achievementUnlocker: {
                ...defaultSettings.achievementUnlocker,
                ...currentSettings.achievementUnlocker
            }
        };
        if (JSON.stringify(currentSettings) !== JSON.stringify(updatedSettings)) {
            localStorage.setItem('settings', JSON.stringify(updatedSettings));
        }
        setSettings(updatedSettings);
    }, [refreshKey]);

    const resetSettings = () => {
        localStorage.removeItem('settings');
        localStorage.removeItem('steamCookies');
        setSettings(null);
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <React.Fragment key={refreshKey}>
            <div className='w-calc min-h-calc max-h-calc overflow-y-auto'>
                <div className='p-4'>
                    <div className='flex justify-between items-center'>
                        <div className='flex flex-col'>
                            <p className='text-lg font-semibold'>
                                Settings
                            </p>
                            <p className='text-xs text-gray-400'>
                                v{version}
                            </p>
                        </div>

                        <div className='flex items-center gap-2'>
                            <Button size='sm' className='flex justify-center items-center bg-red-400 px-3 py-2 rounded-sm' onClick={resetSettings}>
                                <p className='flex items-center gap-2 font-medium text-xs text-offwhite'>
                                    Reset settings
                                </p>
                            </Button>

                            <Dropdown classNames={{ content: ['rounded p-0'] }}>
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        size='sm'
                                        className='bg-base border border-border rounded-sm'
                                    >
                                        <BiDotsVerticalRounded size={24} />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label='Settings actions'>
                                    <DropdownItem key='help' className='rounded p-0 m-0'>
                                        <ExtLink href={'https://github.com/probablyraging/steam-game-idler/wiki'} className={'flex w-full px-2 py-1'}>
                                            Help
                                        </ExtLink>
                                    </DropdownItem>
                                    <DropdownItem key='changelog' className='rounded p-0 m-0'>
                                        <ExtLink href={'https://github.com/probablyraging/steam-game-idler/releases'} className={'flex w-full px-2 py-1'}>
                                            Changelog
                                        </ExtLink>
                                    </DropdownItem>
                                    <DropdownItem key='report' className='rounded p-0 m-0'>
                                        <ExtLink href={'https://github.com/probablyraging/steam-game-idler/issues/new?assignees=ProbablyRaging&labels=bug%2Cinvestigating&projects=&template=issue_report.yml&title=Title'} className={'flex w-full px-2 py-1'}>
                                            Report an issue
                                        </ExtLink>
                                    </DropdownItem>
                                    <DropdownItem key='coffee' className='rounded p-0 m-0'>
                                        <ExtLink href={'https://buymeacoffee.com/probablyraging'} className={'flex w-full px-2 py-1'}>
                                            Buy me a coffee
                                        </ExtLink>
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>

                    <Tabs aria-label='Settings tabs' color='primary' variant='underlined' className='mt-6' classNames={{ tab: ['pl-0'] }}>
                        <Tab key='card-farming' title='Card Farming'>
                            <CardSettings settings={settings} setSettings={setSettings} />
                        </Tab>
                        <Tab key='achievement-unlocker' title='Achievement Unlocker'>
                            <AchievementSettings settings={settings} setSettings={setSettings} />
                        </Tab>
                        <Tab key='logs' title='Logs'>
                            <Logs />
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </React.Fragment >
    );
}