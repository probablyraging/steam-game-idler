import React from 'react';
import ExtLink from './ExtLink';

export default function FreeGamesToast() {
    return (
        <React.Fragment>
            <ExtLink href={'https://store.steampowered.com/search/?maxprice=free&supportedlang=english&specials=1&ndl=1'}>
                <div className='flex flex-col'>
                    <p>Free Steam games are available</p>
                    <p className='mt-1'>Click here to view</p>
                </div>
            </ExtLink>
        </React.Fragment>
    );
}