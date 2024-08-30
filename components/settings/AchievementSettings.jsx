import React, { useState, useEffect } from 'react';
import { Checkbox, Slider, Spinner } from '@nextui-org/react';
import { logEvent } from '@/utils/utils';

export default function AchievementSettings({ settings, setSettings }) {
    const [labelInterval, setLabelInterval] = useState(null);
    const [localSettings, setLocalSettings] = useState(null);

    useEffect(() => {
        if (settings && settings.achievementUnlocker) {
            setLocalSettings(settings);
            setLabelInterval(`${settings.achievementUnlocker.interval[0]} and ${settings.achievementUnlocker.interval[1]}`);
        }
    }, [settings]);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        if (localSettings && localSettings.achievementUnlocker) {
            const updatedSettings = {
                ...localSettings,
                achievementUnlocker: {
                    ...localSettings.achievementUnlocker,
                    [name]: checked
                }
            };
            updateSettings(updatedSettings);
            logEvent(`[Settings - Achievement Unlocker] Changed '${name}' to '${checked}'`);
        }
    };

    const handleSliderChange = (e) => {
        if (localSettings && localSettings.achievementUnlocker) {
            const updatedSettings = {
                ...localSettings,
                achievementUnlocker: {
                    ...localSettings.achievementUnlocker,
                    interval: e
                }
            };
            updateSettings(updatedSettings);
            logEvent(`[Settings - Achievement Unlocker] Changed 'interval' to '${e}'`);
        }
    };

    const updateSettings = (newSettings) => {
        setLocalSettings(newSettings);
        setSettings(newSettings);
        try {
            localStorage.setItem('settings', JSON.stringify(newSettings));
        } catch (error) {
            console.error('Failed to save settings to localStorage:', error);
        }
    };

    const updateLabel = (e) => {
        setLabelInterval(`${e[0]} and ${e[1]}`);
    };

    if (!localSettings || !localSettings.achievementUnlocker) {
        return <Spinner />;
    }

    return (
        <React.Fragment>
            <div className='flex flex-col gap-6 p-2'>
                <div className='flex flex-col gap-4'>
                    <Checkbox
                        name='idle'
                        isSelected={localSettings.achievementUnlocker.idle}
                        onChange={handleCheckboxChange}
                    >
                        <div className='flex items-center gap-1'>
                            <p className='text-xs'>
                                Idle games while active
                            </p>
                        </div>
                    </Checkbox>

                    <Checkbox
                        name='hidden'
                        isSelected={localSettings.achievementUnlocker.hidden}
                        onChange={handleCheckboxChange}
                    >
                        <div className='flex items-center gap-1'>
                            <p className='text-xs'>
                                Skip hidden achievements
                            </p>
                        </div>
                    </Checkbox>

                    <Slider
                        label={
                            <div className='flex justify-between items-center gap-1 min-w-[350px]'>
                                <p className='text-xs'>
                                    Unlock interval
                                </p>
                                <p className='text-xs'>
                                    between {labelInterval} minutes
                                </p>
                            </div>
                        }
                        size='sm'
                        step={5}
                        minValue={5}
                        maxValue={720}
                        defaultValue={localSettings.achievementUnlocker.interval}
                        formatOptions={{ style: 'currency', currency: 'USD' }}
                        hideValue
                        className='max-w-[350px]'
                        classNames={{ value: ['text-xs'] }}
                        onChangeEnd={handleSliderChange}
                        onChange={updateLabel}
                    />
                </div>
            </div>
        </React.Fragment>
    );
}