import React, { useEffect, useState } from 'react';
import ExtLink from '../ExtLink';
import CardSettings from './CardSettings';
import AchievementSettings from './AchievementSettings';
import Logs from './Logs';
import { BiCoffeeTogo, BiListUl, BiSolidBug, BiSolidHelpCircle } from 'react-icons/bi';
import { getVersion } from '@tauri-apps/api/app';

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const [version, setVersion] = useState('v0.0.0');

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
    }, []);

    return (
        <React.Fragment>
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

                        <div className='flex gap-2'>
                            <ExtLink className={'bg-sidebar hover:bg-opacity-90 px-3 py-2 rounded-sm duration-200'} href={'https://github.com/probablyraging/steam-game-idler/wiki'}>
                                <p className='flex items-center gap-2 font-medium text-xs text-white'>
                                    <BiSolidHelpCircle fontSize={18} /> Help
                                </p>
                            </ExtLink>
                            <ExtLink className={'bg-sidebar hover:bg-opacity-90 px-3 py-2 rounded-sm duration-200'} href={'https://github.com/probablyraging/steam-game-idler/releases'}>
                                <p className='flex items-center gap-2 font-medium text-xs text-white'>
                                    <BiListUl fontSize={18} /> Changelog
                                </p>
                            </ExtLink>
                            <ExtLink className={'bg-sidebar hover:bg-opacity-90 px-3 py-2 rounded-sm duration-200'} href={'https://github.com/probablyraging/steam-game-idler/issues/new?assignees=ProbablyRaging&labels=bug%2Cinvestigating&projects=&template=issue_report.yml&title=Title'}>
                                <p className='flex items-center gap-2 font-medium text-xs text-white'>
                                    <BiSolidBug fontSize={18} /> Report an issue
                                </p>
                            </ExtLink>
                            <ExtLink className={'bg-sidebar hover:bg-opacity-90 px-3 py-2 rounded-sm duration-200'} href={'https://buymeacoffee.com/probablyraging'}>
                                <p className='flex items-center gap-2 font-medium text-xs text-white'>
                                    <BiCoffeeTogo fontSize={18} /> Buy me a coffee
                                </p>
                            </ExtLink>
                        </div>
                    </div>

                    <div className='flex flex-col gap-4'>
                        <CardSettings settings={settings} setSettings={setSettings} />
                        <AchievementSettings settings={settings} setSettings={setSettings} />
                    </div>

                    <Logs />
                </div>
            </div>
        </React.Fragment>
    );
}