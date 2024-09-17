import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Input } from '@nextui-org/react';
import { antiAwayStatus, logEvent } from '@/utils/utils';
import { enable, isEnabled, disable } from 'tauri-plugin-autostart-api';
import ExtLink from '../ExtLink';

export default function GeneralSettings({ settings, setSettings }) {
    const [localSettings, setLocalSettings] = useState(null);
    const [startupState, setStartupState] = useState(null);
    const [keyValue, setKeyValue] = useState('');
    const [hasKey, setHasKey] = useState(false);

    useEffect(() => {
        if (settings && settings.general) {
            setLocalSettings(settings);
        }
    }, [settings]);

    useEffect(() => {
        const checkIfStartupEnabled = async () => {
            const isEnabledState = await isEnabled();
            setStartupState(isEnabledState);
        };
        checkIfStartupEnabled();
    }, []);

    useEffect(() => {
        const apiKey = localStorage.getItem('apiKey');
        if (apiKey && apiKey.length > 0) {
            setHasKey(true);
            setKeyValue(apiKey);
        }
    }, []);

    const handleCheckboxChange = (e) => {
        try {
            const { name, checked } = e.target;
            if (localSettings && localSettings.general) {
                const updatedSettings = {
                    ...localSettings,
                    general: {
                        ...localSettings.general,
                        [name]: checked
                    }
                };
                updateSettings(updatedSettings);
                logEvent(`[Settings - General] Changed '${name}' to '${checked}'`);
            }
        } catch (error) {
            console.error('Error in (handleCheckboxChange):', error);
            logEvent(`[Error] in (handleCheckboxChange): ${error}`);
        }
    };

    const updateSettings = (newSettings) => {
        setLocalSettings(newSettings);
        setSettings(newSettings);
        try {
            localStorage.setItem('settings', JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error in (updateSettings):', error);
            logEvent(`[Error] in (updateSettings): ${error}`);
        }
    };

    const handleAntiAway = (active) => {
        antiAwayStatus(active);
    };

    const handleRunAtStartupChange = async () => {
        const isEnabledState = await isEnabled();
        if (isEnabledState) {
            await disable();
        } else {
            await enable();
        }
        setStartupState(!isEnabledState);
    };

    const handleKeyChange = (e) => {
        setKeyValue(e.target.value);
    };

    const handleKeySave = async () => {
        try {
            if (keyValue.length > 0) {
                localStorage.setItem('apiKey', keyValue);
                setHasKey(true);
            }
        } catch (error) {
            console.error('Error in (handleKeySave):', error);
            logEvent(`[Error] in (handleKeySave): ${error}`);
        }
    };

    const handleClear = async () => {
        try {
            localStorage.removeItem('apiKey');
            setKeyValue('');
            setHasKey(false);
            logEvent('[Settings - General] Cleared Steam web API key');
        } catch (error) {
            console.error('Error in (handleClear):', error);
            logEvent(`[Error] in (handleClear): ${error}`);
        }
    };

    return (
        <React.Fragment>
            <div className='flex flex-col gap-4 p-2'>
                <Checkbox
                    name='stealthIdle'
                    isSelected={localSettings?.general?.stealthIdle}
                    onChange={handleCheckboxChange}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            Stealth idle windows
                        </p>
                    </div>
                </Checkbox>

                <Checkbox
                    name='antiAway'
                    isSelected={localSettings?.general?.antiAway}
                    onChange={(e) => {
                        handleCheckboxChange(e);
                        handleAntiAway(!localSettings?.general?.antiAway);
                    }}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            Anti-away status
                        </p>
                    </div>
                </Checkbox>

                <Checkbox
                    name='clearData'
                    isSelected={localSettings?.general?.clearData}
                    onChange={handleCheckboxChange}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            Delete locally saved data on logout
                        </p>
                    </div>
                </Checkbox>

                <Checkbox
                    isSelected={startupState}
                    onChange={handleRunAtStartupChange}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            Run at startup
                        </p>
                    </div>
                </Checkbox>

                <Checkbox
                    name='minimizeToTray'
                    isSelected={localSettings?.general?.minimizeToTray}
                    onChange={handleCheckboxChange}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            Minimize to tray
                        </p>
                    </div>
                </Checkbox>

                <div className='flex flex-col'>
                    <p className='text-xs my-2' >
                        Use your own
                        <ExtLink href={'https://steamcommunity.com/dev/apikey'} className={'mx-1 text-blue-400'}>
                            Steam web API key
                        </ExtLink>
                        instead of the default one <span className='italic'>(optional)</span>
                    </p>
                    <div className='flex gap-4'>
                        <Input
                            size='sm'
                            placeholder='Steam web API key'
                            className='max-w-[280px]'
                            classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                            value={keyValue}
                            onChange={handleKeyChange}
                            type={'password'}
                        />
                        <Button
                            isDisabled={hasKey || !keyValue}
                            size='sm'
                            className='bg-sgi font-semibold text-offwhite rounded-sm'
                            onClick={handleKeySave}
                        >
                            Save
                        </Button>
                        <Button isDisabled={!hasKey} size='sm' className='font-semibold text-offwhite bg-red-400 rounded-sm' onClick={handleClear}>
                            Clear
                        </Button>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}