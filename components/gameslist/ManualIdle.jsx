import React, { useState } from 'react';
import { Button, Modal, ModalContent, ModalBody, useDisclosure, Input } from '@nextui-org/react';
import { invoke } from '@tauri-apps/api/tauri';
import { toast } from 'react-toastify';
import { IoAdd } from 'react-icons/io5';
import { FaHashtag } from 'react-icons/fa';

export default function ManualIdle() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [inputValue, setInputValue] = useState('');

    const handleIdle = async (onClose) => {
        try {
            const steamRunning = await invoke('check_status');
            if (steamRunning) {
                const path = await invoke('get_file_path');
                const fullPath = path.replace('Steam Game Idler.exe', 'libs\\SteamUtility.exe');
                await invoke('start_idle', { filePath: fullPath, appId: inputValue.toString(), quiet: 'false' });
                setInputValue('');
                onClose();
            } else {
                toast.error('Steam is not running');
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        const numericValue = value.replace(/[^0-9]/g, '');
        setInputValue(numericValue);
    };

    return (
        <React.Fragment>
            <Button
                isIconOnly
                size='sm'
                className='rounded-full bg-sgi text-offwhite'
                startContent={<IoAdd fontSize={18} />}
                onClick={onOpen}
            />

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => setInputValue('')} hideCloseButton className='bg-base border border-border rounded-sm w-[350px]'>
                <ModalContent>
                    {(onClose) => (
                        <ModalBody className='px-3 py-2'>
                            <p className='text-sm'>
                                Manual idling
                            </p>
                            <p className='text-xs'>
                                Useful for idling games that you do not own, but have in your library, such as family shared games
                            </p>
                            <div className='flex gap-2 w-full'>
                                <Input
                                    isClearable
                                    size='sm'
                                    placeholder='Enter a game ID'
                                    startContent={<FaHashtag />}
                                    className='max-w-[200px]'
                                    classNames={{
                                        inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-sm group-data-[focus-visible=true]:ring-transparent group-data-[focus-visible=true]:ring-offset-transparent'],
                                        input: ['text-xs']
                                    }}
                                    value={inputValue}
                                    onChange={handleChange}
                                    onClear={() => { setInputValue(''); }}
                                    autoFocus
                                />
                                <Button
                                    size='sm'
                                    isDisabled={inputValue.length === 0}
                                    className='bg-sgi min-h-[30px] font-semibold text-offwhite rounded-sm'
                                    onClick={() => handleIdle(onClose)}
                                >
                                    Idle
                                </Button>
                            </div>
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
}