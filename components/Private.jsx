import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@nextui-org/react';

export default function Private({ steamId }) {
    return (
        <React.Fragment>
            <div className='flex justify-center items-center w-calc min-h-calc max-h-calc'>
                <div className='flex justify-center items-center flex-col border border-border min-w-[400px] max-w-[400px] rounded-lg shadow-soft-lg dark:shadow-none'>
                    <div className='flex items-center flex-col gap-2 p-6'>
                        <Image src={'/logo.webp'} width={32} height={32} alt='logo' />
                        <p className='text-4xl'>
                            Uh-oh!
                        </p>
                    </div>
                    <div className='flex justify-center items-center flex-col gap-7 pb-6'>
                        <p className='text-center'>This account has their games list set to private so we&apos;re unable to view their games.</p>
                        <Link href={`https://steamcommunity.com/profiles/${steamId}/edit/settings`} target='_blank'>
                            <Button color='primary' size='sm' className='text-white dark:text-black font-medium rounded-sm'>
                                Change Account Privacy
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}