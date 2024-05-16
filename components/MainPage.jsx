import React from 'react';
import GameList from './GameList';
import Header from './Header';

export default function MainPage({ userSummary, setUserSummary }) {
    return (
        <div className='w-full h-full min-h-screen bg-base'>
            <Header userSummary={userSummary} setUserSummary={setUserSummary} />
            <GameList steamId={userSummary.steamId} />
        </div>
    )
}