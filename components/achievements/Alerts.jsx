import React from 'react';
import { Button } from '@nextui-org/react';
import { TiWarning } from 'react-icons/ti';
import { IoIosClose } from 'react-icons/io';
import { FaInfoCircle } from 'react-icons/fa';

export default function Alerts({ achievementsUnavailable, showAlertOne, setShowAlertOne, showAlertTwo, setShowAlertTwo }) {
    const handleAlert = (val) => {
        if (val === 1) {
            localStorage.setItem('alertOne', false);
            setShowAlertOne('false');
        }
        if (val === 2) {
            localStorage.setItem('alertTwo', false);
            setShowAlertTwo('false');
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

            {showAlertTwo !== 'false' && (
                <div className='flex justify-between items-center w-full p-1 bg-blue-100 border border-blue-300 rounded my-2'>
                    <div className='flex justify-between items-center w-full gap-2 text-xs font-semibold text-blue-400'>
                        <div className='flex items-center gap-2'>
                            <FaInfoCircle fontSize={18} />
                            <p>Please note that unlocking/locking achievements is instant but may take up to 5 minutes to be reflected on this page. Check your game&apos;s achievements page on Steam for real-time changes.</p>
                        </div>
                        <Button
                            isIconOnly
                            size='sm'
                            className='bg-transparent text-blue-400 hover:text-blue-500'
                            startContent={<IoIosClose fontSize={24} />}
                            onClick={() => { handleAlert(2); }}
                        />
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}