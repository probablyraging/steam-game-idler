import React, { useState } from 'react';
import { Button, Modal, ModalContent, ModalBody, useDisclosure, Input, ModalFooter } from '@nextui-org/react';
import { IoAdd } from 'react-icons/io5';
import { FaInfoCircle } from 'react-icons/fa';
import { logEvent } from '@/utils/utils';

export default function ManualAdd({ setFavorites }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleIdle = async (onClose) => {
        setIsLoading(true);
        fetch('https://apibase.vercel.app/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'game-details', appId: inputValue }),
        }).then(async res => {
            if (res.status !== 500) {
                const data = await res.json();
                const item = { game: { id: data.steam_appid, name: data.name } };
                let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
                favorites.push(JSON.stringify(item));
                localStorage.setItem('favorites', JSON.stringify(favorites));
                const newFavorites = (localStorage.getItem('favorites') && JSON.parse(localStorage.getItem('favorites'))) || [];
                setFavorites(newFavorites.map(JSON.parse));
                logEvent(`[Favorites] Added ${item.game.name} (${item.game.id})`);
                setIsLoading(false);
                onClose();
            }
        });
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

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => setInputValue('')} className='bg-container border border-border rounded-md w-[350px]'>
                <ModalContent>
                    {(onClose) => (
                        <React.Fragment>
                            <ModalBody className='flex gap-5 p-4'>
                                <p className='text-sm font-semibold uppercase'>
                                    Add a game
                                </p>
                                <p className='text-xs'>
                                    Add games that you do not own, but have in your library, such as family shared games.
                                </p>

                                <div className='flex items-center gap-1 w-full p-1 bg-[#c3e3fb] dark:text-[#bdddff] dark:bg-[#366f9b] border border-[#93c4e9] dark:border-[#5585aa] rounded-sm'>
                                    <FaInfoCircle fontSize={14} />
                                    <p className='text-xs'>
                                        Games will be added to your &apos;Favorites&apos; list.
                                    </p>
                                </div>

                                <Input
                                    isClearable
                                    size='sm'
                                    placeholder='Enter a game ID'
                                    classNames={{
                                        inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-sm group-data-[focus-visible=true]:ring-transparent group-data-[focus-visible=true]:ring-offset-transparent'],
                                        input: ['text-xs']
                                    }}
                                    value={inputValue}
                                    onChange={handleChange}
                                    onClear={() => { setInputValue(''); }}
                                    autoFocus
                                />
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
                                    isLoading={isLoading}
                                    isDisabled={inputValue.length === 0}
                                    className='bg-sgi max-h-[25px] font-semibold text-offwhite rounded-sm'
                                    onClick={() => handleIdle(onClose)}
                                >
                                    Add
                                </Button>
                            </ModalFooter>
                        </React.Fragment>
                    )}
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
}