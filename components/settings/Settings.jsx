import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from '@nextui-org/react';
import GeneralSettings from './GeneralSettings';
import CardSettings from './CardSettings';
import AchievementSettings from './AchievementSettings';
import Logs from './Logs';
import { getVersion } from '@tauri-apps/api/app';
import SettingsMenu from './SettingsMenu';
import ResetSettings from './ResetSettings';
import { Time } from '@internationalized/date';
import { logEvent } from '@/utils/utils';

export default function Settings({ setHasUpdate, setUpdateManifest }) {
    const [settings, setSettings] = useState(null);
    const [version, setVersion] = useState('v0.0.0');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const getAppVersion = async () => {
            try {
                const appVersion = await getVersion();
                setVersion(appVersion);
            } catch (error) {
                console.error('Error in (getAppVersion):', error);
                logEvent(`[Error] in (getAppVersion): ${error}`);
            }
        };
        getAppVersion();
    }, []);

    useEffect(() => {
        const defaultSettings = {
            general: {
                stealthIdle: false,
                clearData: true
            },
            cardFarming: {
                listGames: true,
                allGames: false
            },
            achievementUnlocker: {
                idle: true,
                hidden: false,
                schedule: false,
                scheduleFrom: new Time(8, 30),
                scheduleTo: new Time(23, 0),
                interval: [30, 130],
            }
        };
        let currentSettings = JSON.parse(localStorage.getItem('settings')) || {};
        let updatedSettings = {
            general: {
                ...defaultSettings.general,
                ...currentSettings.general
            },
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
                            <ResetSettings setSettings={setSettings} setRefreshKey={setRefreshKey} />

                            <SettingsMenu setHasUpdate={setHasUpdate} setUpdateManifest={setUpdateManifest} />
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
                            tab: 'px-6 py-3 rounded-none bg-transparent px-4 data-[hover-unselected=true]:bg-gray-500 data-[hover-unselected=true]:bg-opacity-5 data-[hover-unselected=true]:opacity-100',
                            tabContent: 'text-xs',
                            cursor: 'bg-base w-full rounded-sm',
                            panel: 'bg-titlebar rounded-sm rounded-tl-none',
                        }}
                    >
                        <Tab key='general' title='General'>
                            <GeneralSettings settings={settings} setSettings={setSettings} />
                        </Tab>
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