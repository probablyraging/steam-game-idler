import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input } from '@nextui-org/react';
import Link from 'next/link';

export default function SetupModal({ setUserSummary }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(<p>What is <Link href={'https://help.steampowered.com/en/faqs/view/2816-BE67-5B69-0FEC'} target='_blank'>SteamID64</Link>?</p>);

    useEffect(() => {
        onOpen();
    }, []);

    const verify = (uid) => {
        setIsLoading(true);
        window.ipc.send('api/user-summary', { uid: uid });

        window.ipc.on('user-summary', (reply) => {
            if (reply.error) {
                setError(<p className='text-red-400'>Check the Steam username or ID and try again</p>);
                setIsLoading(false);
                setTimeout(() => {
                    setError(<p>What is <Link href={'https://help.steampowered.com/en/faqs/view/2816-BE67-5B69-0FEC'} target='_blank'>SteamID64</Link>?</p>);
                }, 3000);
            } else {
                localStorage.setItem('userSummary', JSON.stringify(reply));
                setUserSummary(reply);
                setIsLoading(false);
            }
        });
    };

    const handleSubmit = async (e) => {
        if (inputValue.length > 0) {
            verify(inputValue);
        }
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <React.Fragment>
            <div className='h-full min-h-screen bg-neutral-900'>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} hideCloseButton backdrop='blur'>
                    <ModalContent>
                        <React.Fragment>
                            <ModalHeader className='border-b border-neutral-200 dark:border-neutral-800 py-2 px-4'>Welcome</ModalHeader>
                            <ModalBody className='p-4'>
                                <p className='text-sm mb-4'>
                                    In order to use Steam Game Idler you must enter your Steam username or SteamID64
                                </p>
                                <Input
                                    label='Steam username or ID64'
                                    size='sm'
                                    value={inputValue}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    description={error}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button className='font-medium bg-pop text-white dark:text-black rounded' size='sm' isLoading={isLoading} onClick={handleSubmit}>
                                    Next
                                </Button>
                            </ModalFooter>
                        </React.Fragment>
                    </ModalContent>
                </Modal>
            </div>
        </React.Fragment>
    )
}