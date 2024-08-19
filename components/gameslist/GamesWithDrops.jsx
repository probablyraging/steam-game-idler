import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function GamesWithDrops({ setFilteredGames, setVisibleGames }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        const userSummary = JSON.parse(localStorage.getItem('userSummary')) || {};
        const steamCookies = JSON.parse(localStorage.getItem('steamCookies')) || {};
        if (!steamCookies.sid || !steamCookies.sls) {
            setIsLoading(false);
            return toast.error('Missing credentials in Settings');
        }
        const validate = await fetch('https://apibase.vercel.app/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'validate-session', sid: steamCookies?.sid, sls: steamCookies?.sls }),
        });
        if (validate.status === 500) {
            localStorage.removeItem('steamCookies');
            setIsLoading(false);
            return toast.error('Steam credentials need to be updated');
        }
        const response = await fetch('https://apibase.vercel.app/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'games-with-drops', sid: steamCookies?.sid, sls: steamCookies?.sls, steamId: userSummary.steamId }),
        });
        if (response.status === 500) {
            localStorage.removeItem('steamCookies');
            setIsLoading(false);
            return toast.error('Steam credentials need to be updated');
        }
        const data = await response.json();
        const gameDataArr = [];
        if (data.games && data.games.length > 0) {
            for (const game of data.games) {
                gameDataArr.push(JSON.stringify(game));
            }
            localStorage.setItem('cardFarming', JSON.stringify(gameDataArr));
            setFilteredGames(gameDataArr.map(JSON.parse));
            setVisibleGames(gameDataArr.map(JSON.parse).slice(0, 50));
            setIsLoading(false);
        } else {
            setIsLoading(false);
            return toast.error('No games founds. Try manually adding them');
        }
    };

    return (
        <React.Fragment>
            <Button isLoading={isLoading} size='sm' className='bg-sgi rounded-full' onClick={handleClick}>
                <div className='flex items-center gap-1'>
                    <p className='font-semibold text-white'>
                        Add All Games With Drops Remaining
                    </p>
                </div>
            </Button>
            <ToastContainer toastStyle={{ fontSize: 12 }} position='bottom-right' theme='dark' transition={Slide} pauseOnFocusLoss={false} pauseOnHover={false} autoClose={3000} />
        </React.Fragment>
    );
}