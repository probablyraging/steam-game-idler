import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalBody, Button, useDisclosure, ModalFooter } from '@nextui-org/react';
import ExtLink from './ExtLink';
import { logEvent } from '@/utils/utils';

export default function UpdateModal({ updateAvailable, updateManifest, setInitUpdate }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [currentVersion, setCurrentVersion] = useState('');
    const [newVersion, setNewVersion] = useState('');

    useEffect(() => {
        const prepareUpdate = async () => {
            if (updateAvailable) {
                const newVersion = updateManifest ? updateManifest?.version : 'Unknown';
                setCurrentVersion(currentVersion);
                setNewVersion(newVersion);
                onOpen();
            }
        };
        prepareUpdate();
    }, [updateAvailable]);

    const handleUpdate = async (onClose) => {
        try {
            onClose();
            setTimeout(() => {
                setInitUpdate(true);
            }, 500);
        } catch (error) {
            console.error('Error in (checkForUpdates):', error);
            logEvent(`[Error] in (checkForUpdates): ${error}`);
        }
    };

    return (
        <React.Fragment>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} className='bg-container border border-border rounded-md w-[350px]'>
                <ModalContent>
                    {(onClose) => (
                        <React.Fragment>
                            <ModalBody className='flex gap-5 p-4'>
                                <p className='text-sm font-semibold uppercase'>
                                    Update Available
                                </p>
                                <p className='text-xs'>
                                    Version <span className='font-mono bg-containerhover px-1 py-0.5 rounded'>{newVersion}</span> is now available to install
                                </p>
                                <ExtLink href={'https://github.com/probablyraging/steam-game-idler/releases'}>
                                    <p className='text-xs text-blue-400 mb-2'>
                                        View the changelog
                                    </p>
                                </ExtLink>
                            </ModalBody>
                            <ModalFooter className='border-t border-border bg-footer px-4 py-3'>
                                <Button
                                    size='sm'
                                    variant='light'
                                    className='max-h-[25px] font-semibold rounded-sm'
                                    onClick={onClose}
                                >
                                    Not Now
                                </Button>
                                <Button
                                    size='sm'
                                    className='bg-[#23b768] max-h-[25px] font-semibold text-offwhite rounded-sm'
                                    onClick={() => handleUpdate(onClose)}
                                >
                                    Install Update
                                </Button>
                            </ModalFooter>
                        </React.Fragment>
                    )}
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
}