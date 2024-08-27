import React, { useState } from 'react';
import { Button, Modal, ModalContent, ModalBody, useDisclosure, Input } from '@nextui-org/react';
import { IoAdd } from 'react-icons/io5';
import { FaHashtag } from 'react-icons/fa';
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

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => setInputValue('')} hideCloseButton className='bg-base border border-border rounded-sm w-[350px]'>
                <ModalContent>
                    {(onClose) => (
                        <ModalBody className='px-3 py-2'>
                            <p className='text-sm'>
                                Manually add a game
                            </p>
                            <p className='text-xs'>
                                Add games that you do not own, but have in your library, such as family shared games
                            </p>
                            <p className='text-xs'>
                                Games will be added to your &apos;Favorites&apos;
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
                                    isLoading={isLoading}
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