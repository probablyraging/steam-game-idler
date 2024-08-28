import React, { useState } from 'react';
import { Modal, ModalContent, ModalBody, Button, useDisclosure } from '@nextui-org/react';
import { lockAchievement, unlockAchievement } from '@/utils/utils';
import { toast } from 'react-toastify';

export default function BulkButtons({ appId, appName, achievementsUnavailable, btnLoading, achievementList, inputValue, setBtnLoading }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [state, setState] = useState('');

    const handleSetState = (state) => {
        setState(state);
        onOpen();
    };

    const handleUnlockAll = async (onClose) => {
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
    };

    const handleLockAll = async (onClose) => {
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
                                isDisabled={!achievementList || inputValue.length > 0}
                                className='bg-sgi font-semibold text-offwhite rounded-sm'
                                onClick={() => handleSetState('unlock')}
                            >
                                Unlock all
                            </Button>
                            <Button
                                size='sm'
                                isLoading={btnLoading}
                                isDisabled={!achievementList || inputValue.length > 0}
                                className='bg-red-400 font-semibold text-offwhite rounded-sm'
                                onClick={() => handleSetState('lock')}
                            >
                                Lock all
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className='bg-base border border-border rounded-md'>
                <ModalContent>
                    {(onClose) => (
                        <ModalBody className='p-4'>
                            <div className='flex flex-col gap-2 w-full'>
                                <p>
                                    Confirm
                                </p>
                                <p className='text-xs mb-2'>
                                    Are you sure you want to {state} all achievements?
                                </p>
                                <div className='flex gap-2 mt-2'>
                                    <Button
                                        size='sm'
                                        className='bg-sgi min-h-[30px] font-semibold text-offwhite rounded-sm'
                                        onClick={state === 'unlock' ? () => handleUnlockAll(onClose) : () => handleLockAll(onClose)}
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