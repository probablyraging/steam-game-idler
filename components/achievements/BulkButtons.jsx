import React, { useState } from 'react';
import { Modal, ModalContent, ModalBody, Button, useDisclosure, ModalFooter } from '@nextui-org/react';
import { lockAchievement, unlockAchievement } from '@/utils/utils';
import { toast } from 'react-toastify';
import { invoke } from '@tauri-apps/api/tauri';

export default function BulkButtons({ appId, appName, achievementsUnavailable, btnLoading, achievementList, inputValue, setBtnLoading, currentTab }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [state, setState] = useState('');

    const handleSetState = (state) => {
        setState(state);
        onOpen();
    };

    const handleUnlockAll = async (onClose) => {
        const steamRunning = await invoke('check_status');
        if (steamRunning) {
            setBtnLoading(true);
            onClose();
            let unlocked = 0;
            const total = achievementList.length;
            for (const ach of achievementList) {
                try {
                    await unlockAchievement(appId, ach.name, true);
                    unlocked++;
                    toast.info(`Unlocked ${unlocked} of ${total} achievements`, { autoClose: 1000 });
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (error) {
                    console.error(`Failed to unlock achievement ${ach.name}:`, error);
                }
            }
            setBtnLoading(false);
            toast.success(`Successfully unlocked ${unlocked} of ${total} achievements.`);
        } else {
            onClose();
            toast.error('Steam is not running');
        }
    };

    const handleLockAll = async (onClose) => {
        const steamRunning = await invoke('check_status');
        if (steamRunning) {
            setBtnLoading(true);
            onClose();
            let locked = 0;
            const total = achievementList.length;
            for (const ach of achievementList) {
                try {
                    await lockAchievement(appId, ach.name);
                    locked++;
                    toast.info(`Locked ${locked} of ${total} achievements`, { autoClose: 1000 });
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (error) {
                    console.error(`Failed to unlock achievement ${ach.name}:`, error);
                }
            }
            setBtnLoading(false);
            toast.success(`Successfully locked ${locked} of ${total} achievements.`);
        } else {
            onClose();
            toast.error('Steam is not running');
        }
    };

    return (
        <React.Fragment>
            <div className='flex justify-center items-center w-full'>
                <div className='w-full'>
                    <p className='m-0 p-0'>
                        {appName}
                    </p>
                </div>
                <div className='flex justify-end w-full'>
                    {!achievementsUnavailable && (
                        <div className='flex items-center gap-2'>
                            <Button
                                size='sm'
                                isLoading={btnLoading}
                                isDisabled={!achievementList || inputValue.length > 0 || currentTab === 'statistics'}
                                className='bg-sgi font-semibold text-offwhite rounded-sm'
                                onClick={() => handleSetState('unlock')}
                            >
                                Unlock all
                            </Button>
                            <Button
                                size='sm'
                                isLoading={btnLoading}
                                isDisabled={!achievementList || inputValue.length > 0 || currentTab === 'statistics'}
                                className='bg-red-400 font-semibold text-offwhite rounded-sm'
                                onClick={() => handleSetState('lock')}
                            >
                                Lock all
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className='bg-container border border-border rounded-md w-[350px]'>
                <ModalContent>
                    {(onClose) => (
                        <React.Fragment>
                            <ModalBody className='flex gap-5 p-4'>
                                <p className='text-sm font-semibold uppercase'>
                                    Confirm
                                </p>
                                <p className='text-xs mb-2'>
                                    Are you sure you want to {state} all achievements?
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
                                    onClick={state === 'unlock' ? () => handleUnlockAll(onClose) : () => handleLockAll(onClose)}
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