import React from 'react';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import ExtLink from './ExtLink';

export default function UpdateModal() {
    return (
        <React.Fragment>
            <Modal isOpen hideCloseButton backdrop='blur'>
                <ModalContent>
                    <ModalBody>
                        <div className='flex items-center flex-col gap-4 text-xs mb-2'>
                            <p className='font-semibold text-sm text-center'>
                                Update Required
                            </p>
                            <p className='text-center'>
                                A major update for Steam Game Idler is now available. Please update to the latest version to continue using the application
                            </p>
                            <ExtLink href={'https://github.com/probablyraging/steam-game-idler/releases'}>
                                <div className='bg-sgi rounded-sm px-3 py-2 mt-2'>
                                    <p className='font-semibold text-white'>
                                        Download the latest version from GitHub
                                    </p>
                                </div>
                            </ExtLink>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
}