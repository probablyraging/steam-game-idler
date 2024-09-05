import React, { useEffect, useState } from 'react';
import { Checkbox } from '@nextui-org/react';
import { logEvent } from '@/utils/utils';

export default function GeneralSettings({ settings, setSettings }) {
    const [localSettings, setLocalSettings] = useState(null);

    useEffect(() => {
        if (settings && settings.general) {
            setLocalSettings(settings);
        }
    }, [settings]);

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
            </div>
        </React.Fragment>
    );
}