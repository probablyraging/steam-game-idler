import React from 'react';
import { Button } from '@nextui-org/react';
import { logEvent } from '@/utils/utils';
import { toast } from 'react-toastify';

export default function UpdateToast({ closeToast, updateManifest, setInitUpdate }) {
    const handleUpdate = async () => {
        try {
            closeToast();
            setTimeout(() => {
                setInitUpdate(true);
            }, 500);
        } catch (error) {
            toast.error(`Error in (checkForUpdates): ${error?.message}`);
            console.error('Error in (checkForUpdates):', error);
            logEvent(`[Error] in (checkForUpdates): ${error}`);
        }
    };

    return (
        <React.Fragment>
            <div className='flex flex-col gap-1 text-black dark:text-offwhite'>
                <p className='font-semibold uppercase'>
                    Update available
                </p>
                <p className='text-xs'>
                    Version <span className='font-mono bg-containerhover px-1 py-0.5 rounded'>{updateManifest?.version || 'Unknown'}</span> is now available to install
                </p>

                <div className='flex justify-end w-full gap-2 mt-3'>
                    <Button
                        size='sm'
                        variant='light'
                        className='max-h-[25px] font-semibold rounded-sm'
                        onClick={closeToast}
                    >
                        Not Now
                    </Button>
                    <Button
                        size='sm'
                        className='bg-[#23b768] max-h-[25px] font-semibold text-offwhite rounded-sm'
                        onClick={() => handleUpdate()}
                    >
                        Install Update
                    </Button>
                </div>
            </div>
        </React.Fragment>
    );
}