import React, { useState } from 'react';
import Header from './Header';
import GamesList from './GamesList';
import SideBar from './SideBar';

export default function Dashboard({ userSummary, setUserSummary }) {
    const [sortStyle, setSortStyle] = useState('a-z');
    const [isQuery, setIsQuery] = useState(false);
    const [inputValue, setInputValue] = useState('');

    return (
        <React.Fragment>
            <Header userSummary={userSummary} inputValue={inputValue} setInputValue={setInputValue} setIsQuery={setIsQuery} />

            <div className='flex w-full'>
                <SideBar setUserSummary={setUserSummary} sortStyle={sortStyle} setSortStyle={setSortStyle} />
                <GamesList steamId={userSummary.steamId} sortStyle={sortStyle} inputValue={inputValue} isQuery={isQuery} />
            </div>
        </React.Fragment>
    );
}