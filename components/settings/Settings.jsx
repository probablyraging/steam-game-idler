import React, { useEffect, useState } from 'react';
import CardSettings from './CardSettings';
import AchievementSettings from './AchievementSettings';
import Logs from './Logs';
import { getVersion } from '@tauri-apps/api/app';
import { Button, Tab, Tabs } from '@nextui-org/react';
import SettingsMenu from './SettingsMenu';
import { logEvent } from '@/utils/utils';

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
                idle: true,
                hidden: false,
                interval: [30, 130],
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
        logEvent('[Settings] Reset to default');
    };

    return (
        <React.Fragment key={refreshKey}>
            <div className='w-calc min-h-calc max-h-calc overflow-y-auto'>
                <div className='p-4 pt-2'>
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

                            <SettingsMenu />
                        </div>
                    </div>

                    <Tabs
                        size='sm'
                        aria-label='Settings tabs'
                        color='default'
                        variant='solid'
                        className='mt-6'
                        classNames={{
                            base: 'bg-titlebar rounded-t-sm p-0',
                            tabList: 'gap-0 w-full bg-transparent',
                            tab: 'px-6 py-3 rounded-none bg-transparent px-4',
                            tabContent: 'text-xs',
                            cursor: 'bg-base w-full rounded-sm',
                            panel: 'bg-base border border-border rounded-b rounded-tr',
                        }}
                    >
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