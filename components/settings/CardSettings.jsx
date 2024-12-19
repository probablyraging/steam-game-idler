import React, { useEffect, useState } from 'react';
import ExtLink from '../ExtLink';
import { Button, Checkbox, Input } from '@nextui-org/react';
import { logEvent } from '@/utils/utils';
import { invoke } from '@tauri-apps/api/tauri';
import { toast } from 'react-toastify';

export default function CardSettings({ settings, setSettings }) {
    const [sidValue, setSidValue] = useState('');
    const [slsValue, setSlsValue] = useState('');
    const [smaValue, setSmaValue] = useState('');
    const [hasCookies, setHasCookies] = useState(false);
    const [localSettings, setLocalSettings] = useState(null);

    useEffect(() => {
        if (settings && settings.cardFarming) {
            setLocalSettings(settings);
        }
    }, [settings]);

    useEffect(() => {
        const validateSession = async () => {
            try {
                const steamCookies = JSON.parse(localStorage.getItem('steamCookies'));

                if (steamCookies && steamCookies?.sid && steamCookies?.sls) {
                    setHasCookies(true);
                    setSidValue(steamCookies?.sid);
                    setSlsValue(steamCookies?.sls);
                    setSmaValue(steamCookies?.sma);
                }
            } catch (error) {
                toast.error(`Error in (validateSession): ${error?.message}`);
                console.error('Error in (validateSession):', error);
                logEvent(`[Error] in (validateSession): ${error}`);
            }
        };
        validateSession();
    }, []);

    const handleSidChange = (e) => {
        setSidValue(e.target.value);
    };

    const handleSlsChange = (e) => {
        setSlsValue(e.target.value);
    };

    const handleSmaChange = (e) => {
        setSmaValue(e.target.value);
    };

    const handleSave = async () => {
        try {
            if (sidValue.length > 0 && slsValue.length > 0) {
                const userSummary = JSON.parse(localStorage.getItem('userSummary')) || {};

                const res = await invoke('validate_session', { sid: sidValue, sls: slsValue, sma: smaValue, steamid: userSummary.steamId });

                if (res.user) {
                    localStorage.setItem('steamCookies', JSON.stringify({ sid: sidValue, sls: slsValue, sma: smaValue }));
                    setHasCookies(true);
                    toast.success(`[Card Farming] Logged in as ${res.user}`);
                    logEvent(`[Settings - Card Farming] Logged in as ${res.user}`);
                } else {
                    toast.error('[Card Farming] Incorrect card farming credentials');
                    logEvent('[Error] [Settings - Card Farming] Incorrect card farming credentials');
                }
            }
        } catch (error) {
            toast.error(`Error in (handleSave): ${error?.message}`);
            console.error('Error in (handleSave):', error);
            logEvent(`[Error] in (handleSave): ${error}`);
        }
    };

    const handleClear = async () => {
        try {
            localStorage.removeItem('steamCookies');
            setSidValue('');
            setSlsValue('');
            setSmaValue('');
            setHasCookies(false);
            toast.success('[Card Farming] Logged out');
            logEvent('[Settings - Card Farming] Logged out');
        } catch (error) {
            toast.error(`Error in (handleClear): ${error?.message}`);
            console.error('Error in (handleClear):', error);
            logEvent(`[Error] in (handleClear): ${error}`);
        }
    };

    const handleCheckboxChange = (e) => {
        try {
            const { name, checked } = e.target;
            const updatedSettings = {
                ...localSettings,
                achievementUnlocker: {
                    ...localSettings.achievementUnlocker
                },
                cardFarming: {
                    ...localSettings.cardFarming,
                    [name]: checked
                }
            };
            const checkboxNames = Object.keys(updatedSettings.cardFarming);
            if (checked) {
                const otherCheckboxName = checkboxNames.find(checkbox => checkbox !== name);
                updatedSettings.cardFarming[otherCheckboxName] = false;
            } else {
                const otherCheckboxName = checkboxNames.find(checkbox => checkbox !== name);
                if (!updatedSettings.cardFarming[otherCheckboxName]) {
                    updatedSettings.cardFarming[name] = true;
                }
            }
            localStorage.setItem('settings', JSON.stringify(updatedSettings));
            updateSettings(updatedSettings);
            logEvent(`[Settings - Card Farming] Changed '${name}' to '${updatedSettings.cardFarming[name]}'`);
        } catch (error) {
            toast.error(`Error in (handleCheckboxChange): ${error?.message}`);
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
            toast.error(`Error in (updateSettings): ${error?.message}`);
            console.error('Error in (updateSettings):', error);
            logEvent(`[Error] in (updateSettings): ${error}`);
        }
    };

    return (
        <React.Fragment>
            <div className='flex flex-col gap-4 p-2'>
                <Checkbox
                    name='listGames'
                    isSelected={localSettings?.cardFarming?.listGames}
                    onChange={handleCheckboxChange}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            Card farming list
                        </p>
                    </div>
                </Checkbox>

                <Checkbox
                    name='allGames'
                    isSelected={localSettings?.cardFarming?.allGames}
                    onChange={handleCheckboxChange}
                >
                    <div className='flex items-center gap-1'>
                        <p className='text-xs'>
                            All games with drops
                        </p>
                    </div>
                </Checkbox>

                <div className='w-full'>
                    <p className='text-xs my-2'>
                        Steam credentials are required in order to use the Card Farming feature. <ExtLink href={'https://github.com/probablyraging/steam-game-idler/wiki/steam-credentials'} className='text-blue-400'>Learn more</ExtLink>
                    </p>
                    <div className='flex flex-col mt-4'>
                        <div className='flex flex-col gap-2'>
                            <Input
                                size='sm'
                                label='sessionid'
                                labelPlacement='outside'
                                placeholder=' '
                                className='max-w-[300px]'
                                classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                                value={sidValue}
                                onChange={handleSidChange}
                                type={'password'}
                            />
                            <Input
                                size='sm'
                                label='steamLoginSecure'
                                labelPlacement='outside'
                                placeholder=' '
                                className='max-w-[300px]'
                                classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                                value={slsValue}
                                onChange={handleSlsChange}
                                type={'password'}
                            />
                            <Input
                                size='sm'
                                label={<p>steamParental/steamMachineAuth <span className='italic'>(optional)</span></p>}
                                labelPlacement='outside'
                                placeholder=' '
                                className='max-w-[300px]'
                                classNames={{ inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-md'] }}
                                value={smaValue}
                                onChange={handleSmaChange}
                                type={'password'}
                            />
                            <div className='flex w-[200px] gap-2 mt-2'>
                                <Button
                                    size='sm'
                                    isDisabled={hasCookies || !sidValue || !slsValue}
                                    className='bg-sgi font-semibold text-offwhite rounded-sm w-full'
                                    onClick={handleSave}
                                >
                                    Save
                                </Button>
                                <Button
                                    size='sm'
                                    isDisabled={!hasCookies}
                                    className='font-semibold text-offwhite bg-red-400 rounded-sm w-full'
                                    onClick={handleClear}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}