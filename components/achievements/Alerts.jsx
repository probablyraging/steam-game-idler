import React from 'react';
import { Button } from '@nextui-org/react';
import { TiWarning } from 'react-icons/ti';
import { IoIosClose } from 'react-icons/io';

export default function Alerts({ achievementsUnavailable, showAlertOne, setShowAlertOne }) {
    const handleAlert = (val) => {
        if (val === 1) {
            localStorage.setItem('alertOne', false);
            setShowAlertOne('false');
        }
    };

    return (
        <React.Fragment>
            {achievementsUnavailable && showAlertOne !== 'false' && (
                <div className='flex justify-between items-center w-full p-1 bg-red-100 border border-red-300 rounded my-2'>
                    <div className='flex items-center gap-2 text-xs font-semibold text-red-400'>
                        <TiWarning fontSize={18} />
                        <p>Either this game has no achievements or your &quot;Game details&quot; setting might be set to private in your Steam privacy settings. You can still unlock achievements but the changes won&apos;t be reflected here.</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button
                            isIconOnly
                            size='sm'
                            className='bg-transparent text-red-400 hover:text-red-500'
                            startContent={<IoIosClose fontSize={24} />}
                            onClick={() => { handleAlert(1); }}
                        />
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}