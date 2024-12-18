import React, { useState } from 'react';
import { Modal, ModalContent, ModalBody, Button, useDisclosure, ModalFooter } from '@nextui-org/react';
import { logEvent, unlockAchievement, lockAchievement, updateStat } from '@/utils/utils';
import { toast } from 'react-toastify';
import { invoke } from '@tauri-apps/api/tauri';
import ExtLink from '../ExtLink';
import { SiSteamdb } from 'react-icons/si';

export default function TabButtons({ appId, appName, achievementsUnavailable, statisticsUnavailable, btnLoading, achievementList, inputValue, setBtnLoading, currentTab, initialStatValues, newStatValues }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [state, setState] = useState('');

    const handleSetState = (state) => {
        setState(state);
        onOpen();
    };

    const handleUnlockAll = async (onClose) => {
        try {
            const steamRunning = await invoke('check_status');
            if (steamRunning) {
                setBtnLoading(true);
                onClose();
                let unlocked = 0;
                const total = achievementList.length;
                const toastId = toast.info(`Unlocking 0 of ${total} achievements for ${appName}.`, {
                    autoClose: false,
                    isLoading: true,
                    closeButton: false
                });
                for (const ach of achievementList) {
                    try {
                        await unlockAchievement(appId, ach.name);
                        unlocked++;
                        toast.update(toastId, {
                            render: `Unlocking ${unlocked} of ${total} achievements for ${appName}.`,
                        });
                    } catch (error) {
                        console.error(`Failed to unlock achievement ${ach.name}:`, error);
                    }
                }
                setBtnLoading(false);
                toast.update(toastId, {
                    render: `Successfully unlocked ${unlocked} of ${total} achievements for ${appName}.`,
                    autoClose: true,
                    isLoading: false,
                    closeButton: true,
                    type: 'success'
                });
            } else {
                onClose();
                toast.error('Steam is not running');
            }
        } catch (error) {
            toast.error(`Error in (handleUnlockAll): ${error?.message}`);
            console.error('Error in handleUnlockAll:', error);
            logEvent(`[Error] in (handleUnlockAll): ${error}`);
        }
    };

    const handleLockAll = async (onClose) => {
        try {
            const steamRunning = await invoke('check_status');
            if (steamRunning) {
                setBtnLoading(true);
                onClose();
                let locked = 0;
                const total = achievementList.length;
                const toastId = toast.info(`Locking 0 of ${total} achievements for ${appName}.`, {
                    autoClose: false,
                    isLoading: true,
                    closeButton: false
                });
                for (const ach of achievementList) {
                    try {
                        await lockAchievement(appId, ach.name);
                        locked++;
                        toast.update(toastId, {
                            render: `Locking ${locked} of ${total} achievements for ${appName}.`,
                        });
                    } catch (error) {
                        console.error(`Failed to unlock achievement ${ach.name}:`, error);
                    }
                }
                setBtnLoading(false);
                toast.update(toastId, {
                    render: `Successfully locked ${locked} of ${total} achievements for ${appName}.`,
                    autoClose: true,
                    isLoading: false,
                    closeButton: true,
                    type: 'success'
                });
            } else {
                onClose();
                toast.error('Steam is not running');
            }
        } catch (error) {
            toast.error(`Error in (handleLockAll): ${error?.message}`);
            console.error('Error in handleLockAll:', error);
            logEvent(`[Error] in handleLockAll: ${error}`);
        }
    };

    const handleUpdateAll = () => {
        const changedValues = Object.entries(newStatValues).filter(([key, value]) => {
            return value !== initialStatValues[key];
        });

        if (changedValues.length < 1) {
            toast.info('No changes to save.');
        }

        changedValues.map(async (value) => {
            const statName = value[0];
            const newValue = value[1].toString() || '0';
            try {
                const status = await updateStat(appId, statName, newValue);
                if (!status.error) {
                    toast.success(`Updated ${statName} to ${newValue} for ${appName}`);
                } else {
                    toast.error(`Error: ${status.error}`);
                }
            } catch (error) {
                toast.error(`Error in (handleUpdate): ${error?.message}`);
                console.error('Error in (handleUpdate):', error);
                logEvent(`[Error] in (handleUpdate): ${error}`);
            }
        });
    };

    return (
        <React.Fragment>
            <div className='flex justify-center items-center w-full min-h-8'>
                <div className='flex items-center gap-2 w-full'>
                    <p className='m-0 p-0'>
                        {appName}
                    </p>
                    <ExtLink href={`https://steamdb.info/app/${appId}/stats/`}>
                        <SiSteamdb className='text-sgi' />
                    </ExtLink>
                </div>
                <div className='flex justify-end w-full'>
                    {!achievementsUnavailable && currentTab === 'achievements' && (
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
                                isDisabled={!achievementList || inputValue.length > 0}
                                className='bg-red-400 font-semibold text-offwhite rounded-sm'
                                onClick={() => handleSetState('lock')}
                            >
                                Lock all
                            </Button>
                        </div>
                    )}
                    {!statisticsUnavailable && currentTab === 'statistics' && (
                        <div className='flex items-center gap-2'>
                            <Button
                                size='sm'
                                isLoading={btnLoading}
                                isDisabled={Object.keys(initialStatValues).length < 1}
                                className='bg-sgi font-semibold text-offwhite rounded-sm'
                                onClick={handleUpdateAll}
                            >
                                Save changes
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