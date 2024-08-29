import React from 'react';
import { Button, Modal, ModalContent, ModalBody, useDisclosure, ModalFooter } from '@nextui-org/react';
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

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className='bg-container border border-border rounded-md w-[350px]'>
                <ModalContent>
                    {(onClose) => (
                        <React.Fragment>
                            <ModalBody className='flex gap-5 p-4'>
                                <p className='text-sm font-semibold uppercase'>
                                    Confirm
                                </p>
                                <p className='text-xs mb-2'>
                                    Are you sure you want to reset settings to default?
                                </p>
                            </ModalBody>
                            <ModalFooter className='border-t border-border bg-footer px-4 py-3'>
                                <Button
                                    size='sm'
                                    variant='light'
                                    className='max-h-[25px] font-semibold rounded-sm'
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size='sm'
                                    className='bg-sgi max-h-[25px] font-semibold text-offwhite rounded-sm'
                                    onClick={() => handleResetSettings(onClose)}
                                >
                                    Confirm
                                </Button>
                            </ModalFooter>
                        </React.Fragment>
                    )}
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
}