import React from 'react';
import { Button, Modal, ModalContent, ModalBody, useDisclosure } from '@nextui-org/react';
import { logEvent } from '@/utils/utils';

export default function ResetSettings({ setSettings, setRefreshKey }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const openConfirmation = () => {
        onOpen();
    };

    const handleResetSettings = (onClose) => {
        localStorage.removeItem('settings');
        localStorage.removeItem('steamCookies');
        setSettings(null);
        setRefreshKey(prevKey => prevKey + 1);
        logEvent('[Settings] Reset to default');
        onClose();
    };

    return (
        <React.Fragment>
            <Button size='sm' className='flex justify-center items-center bg-red-400 px-3 py-2 rounded-sm' onClick={openConfirmation}>
                <p className='flex items-center gap-2 font-medium text-xs text-offwhite'>
                    Reset settings
                </p>
            </Button>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className='bg-base border border-border rounded-md'>
                <ModalContent>
                    {(onClose) => (
                        <ModalBody className='p-4'>
                            <div className='flex flex-col gap-2 w-full'>
                                <p>
                                    Confirm
                                </p>
                                <p className='text-xs mb-2'>
                                    Are you sure you want to reset settings to default?
                                </p>
                                <div className='flex gap-2 mt-2'>
                                    <Button
                                        size='sm'
                                        className='bg-sgi min-h-[30px] font-semibold text-offwhite rounded-sm'
                                        onClick={() => handleResetSettings(onClose)}
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        size='sm'
                                        className='bg-red-400 min-h-[30px] font-semibold text-offwhite rounded-sm'
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
}