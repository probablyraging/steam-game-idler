import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Input } from '@nextui-org/react';
import { logEvent, startMobileServer } from '@/utils/utils';

export default function MobileServer({ settings, setSettings }) {
    const [localSettings, setLocalSettings] = useState(null);
    const [customPortValue, setCustomPortValue] = useState('');

    useEffect(() => {

    }, []);

    useEffect(() => {
        if (settings && settings.mobileServer) {
            setLocalSettings(settings);
        }
    }, [settings]);

    useEffect(() => {
        const customPortValue = localStorage.getItem('customPort');
        if (customPortValue && customPortValue.length > 0) {
            setCustomPortValue(customPortValue);
        }
    }, []);

    const handleCheckboxChange = (e) => {
        try {
            const { name, checked } = e.target;
            if (localSettings && localSettings.mobileServer) {
                const updatedSettings = {
                    ...localSettings,
                    mobileServer: {
                        ...localSettings.mobileServer,
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

    const handlePortChange = (e) => {
        const value = e.target.value;
        setCustomPortValue(value);
        localStorage.setItem('customPort', value);
    };

    const handleMobileServer = () => {
        const runLocal = localSettings?.mobileServer?.runLocal;
        const useCustomPort = localSettings?.mobileServer?.customPort;
        const customPort = useCustomPort ? localStorage.getItem('customPort') : null;
        startMobileServer(runLocal, customPort);
        setTimeout(() => {
            const ws = new WebSocket('ws://202.63.74.92:1745');
            ws.onopen = () => {
                console.log('Connected to WebSocket server');
                const gamesList = sessionStorage.getItem('gamesListCache') || [];
                ws.send(JSON.stringify({ type: 'games_list', payload: gamesList }));
            };
        }, 1000);
    };

    return (
        <React.Fragment>
            <div className='flex flex-col gap-4 p-2'>
                <Checkbox
                    name='alwaysRun'
                    isSelected={localSettings?.mobileServer?.alwaysRun}
                    onChange={handleCheckboxChange}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            Always run
                        </p>
                    </div>
                </Checkbox>

                <Checkbox
                    name='runLocal'
                    isSelected={localSettings?.mobileServer?.runLocal}
                    onChange={handleCheckboxChange}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            Local server
                        </p>
                    </div>
                </Checkbox>

                <div className='flex gap-2'>
                    <Checkbox
                        name='customPort'
                        isSelected={localSettings?.mobileServer?.customPort}
                        onChange={handleCheckboxChange}
                    >
                        <div className='flex items-center gap-1'>
                            <p className='text-xs'>
                                Custom port
                            </p>
                        </div>
                    </Checkbox>

                    <Input
                        isDisabled={!localSettings?.mobileServer?.customPort}
                        size='sm'
                        placeholder='1337'
                        className='max-w-[80px]'
                        classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                        value={customPortValue}
                        onChange={handlePortChange}
                        type='number'
                    />
                </div>

                <div className='flex gap-2'>
                    <Button size='sm' className='font-semibold text-offwhite bg-sgi rounded-sm' onClick={handleMobileServer}>
                        Start Mobile Server
                    </Button>
                </div>
            </div>
        </React.Fragment>
    );
}