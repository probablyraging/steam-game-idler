import { Tooltip } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';

export default function Status() {
    const [steamRunning, setSteamRunning] = useState(false);

    useEffect(() => {
        setInterval(() => {
            window.ipc.send('api/status');

            window.ipc.once('status', (reply) => {
                console.log(reply);
                setSteamRunning(reply);
            });
        }, 5000);
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