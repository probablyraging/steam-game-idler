import { Tooltip } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Status() {
    const [steamRunning, setSteamRunning] = useState(false);

    useEffect(() => {
        setInterval(async () => {
            const status = await invoke('check_status');
            setSteamRunning(status);
        }, 1000);
    }, []);

    return (
        <div className=' p-4'>
            {steamRunning ? (
                <div className='flex items-center gap-2'>
                    <div className='w-[10px] h-[10px] bg-green-400 rounded-full'></div>
                    <p className='text-xs'>Steam is running</p>
                </div>
            ) : (
                <Tooltip closeDelay={0} className='text-xs' content='Steam must be running to idle games'>
                    <div className='flex items-center gap-2'>
                        <div className='w-[10px] h-[10px] bg-red-400 rounded-full'></div>
                        <p className='text-xs'>Steam is not running</p>
                    </div>
                </Tooltip>
            )}
        </div>
    )
}