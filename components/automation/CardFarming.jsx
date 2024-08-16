import React, { useEffect, useState, useRef } from 'react';
import { checkDrops, logEvent, startIdler, stopIdler } from '@/utils/utils';
import StopButton from './StopButton';
import Image from 'next/image';
import { Button, Skeleton, Spinner } from '@nextui-org/react';
import { IoCheckmark } from 'react-icons/io5';

export default function CardFarming({ setActivePage }) {
    const isMountedRef = useRef(true);
    const abortControllerRef = useRef(new AbortController());
    const [totalDropsRemaining, setTotalDropsRemaining] = useState(0);
    const [gamesWithDrops, setGamesWithDrops] = useState(new Set());
    const [isComplete, setIsComplete] = useState(false);

    const farmingInterval = 60000 * 30;
    const shortDelay = 15000;
    const mediumDelay = 60000;
    const longDelay = 60000 * 5;

    useEffect(() => {
        const startCardFarming = async () => {
            try {
                const { totalDrops, gamesSet } = await checkGamesForDrops();
                setTotalDropsRemaining(totalDrops);
                setGamesWithDrops(gamesSet);

                if (isMountedRef.current && gamesSet.size > 0) {
                    await farmCards(gamesSet);
                    startCardFarming();
                } else {
                    logEvent('[Card Farming] No games left - stopping');
                    setIsComplete(true);
                }
            } catch (error) {
                console.log('Error in card farming:', error);
                logEvent(`[Error] [Card Farming] ${error}`);
            }
        };

        const abortController = abortControllerRef.current;

        startCardFarming();

        return () => {
            isMountedRef.current = false;
            abortController.abort();
        };
    }, []);

    const checkGamesForDrops = async () => {
        const cardFarming = JSON.parse(localStorage.getItem('cardFarming')) || [];
        const steamCookies = JSON.parse(localStorage.getItem('steamCookies')) || {};
        const userSummary = JSON.parse(localStorage.getItem('userSummary')) || {};

        const gameDataArr = cardFarming.map(game => JSON.parse(game));
        const gamesSet = new Set();
        let totalDrops = 0;

        const dropCheckPromises = gameDataArr.map(async (gameData) => {
            try {
                const dropsRemaining = await checkDrops(userSummary.steamId, gameData.game.id, steamCookies.sid, steamCookies.sls);
                if (dropsRemaining > 0) {
                    logEvent(`[Card Farming] ${dropsRemaining} drops remaining for ${gameData.game.name} - starting`);
                    gamesSet.add({ appId: gameData.game.id, appName: gameData.game.name, icon: gameData.game.icon });
                    totalDrops += dropsRemaining;
                } else {
                    logEvent(`[Card Farming] ${dropsRemaining} drops remaining for ${gameData.game.name} - removed from list`);
                    removeGameFromFarmingList(gameData.game.id);
                }
            } catch (error) {
                logEvent(`[Error] [Card Farming] ${error}`);
            }
        });

        await Promise.all(dropCheckPromises);

        return { totalDrops, gamesSet };
    };

    const farmCards = async (gamesSet) => {
        const farmingPromises = Array.from(gamesSet).map(game => farmGame(game));
        await Promise.all(farmingPromises);
    };

    const farmGame = async (game) => {
        try {
            await startAndStopIdler(game.appId, game.appName, longDelay);
            await delay(mediumDelay);
            await startAndStopIdler(game.appId, game.appName, shortDelay);
            await delay(mediumDelay);
            await startAndStopIdler(game.appId, game.appName, farmingInterval);
            await delay(mediumDelay);
            await startAndStopIdler(game.appId, game.appName, shortDelay);
        } catch (error) {
            logEvent(`[Error] [Card Farming] ${error}`);
        }
    };

    const startAndStopIdler = async (appId, appName, duration) => {
        startIdler(appId, appName, true);
        await delay(duration);
        stopIdler(appId);
    };

    const delay = (ms) => {
        return new Promise((resolve, reject) => {
            const checkInterval = 1000;
            let elapsedTime = 0;

            const intervalId = setInterval(() => {
                if (!isMountedRef.current) {
                    clearInterval(intervalId);
                    reject(new DOMException('Card farming stopped early', 'Stop'));
                } else if (elapsedTime >= ms) {
                    clearInterval(intervalId);
                    resolve();
                }
                elapsedTime += checkInterval;
            }, checkInterval);

            abortControllerRef.current.signal.addEventListener('abort', () => {
                clearInterval(intervalId);
                reject(new DOMException('Card farming stopped early', 'Stop'));
            });
        });
    };

    const removeGameFromFarmingList = (gameId) => {
        const cardFarming = JSON.parse(localStorage.getItem('cardFarming')) || [];
        const updatedCardFarming = cardFarming.filter(game => JSON.parse(game).game.id !== gameId);
        localStorage.setItem('cardFarming', JSON.stringify(updatedCardFarming));
    };

    const handleCancel = () => {
        for (const game of gamesWithDrops) {
            stopIdler(game.appId);
        }
        isMountedRef.current = false;
        abortControllerRef.current.abort();
        setActivePage('games');
    };

    return (
        <React.Fragment>
            <div className='flex justify-evenly items-center flex-col p-4 w-full h-calc'>
                <div className='flex items-center flex-col'>
                    <p className='text-3xl font-semibold mb-2'>
                        Card Farming
                    </p>
                    {gamesWithDrops.size > 0 && totalDropsRemaining ? (
                        <p className='text-sm'>
                            Idling <span className='font-bold text-sgi'>{gamesWithDrops.size}</span> game(s) with <span className='font-bold text-sgi '>{totalDropsRemaining}</span> total card drop(s) remaining
                        </p>
                    ) : (
                        <React.Fragment>
                            {!isComplete ? (
                                <div className='flex py-1 h-[16px]'>
                                    <Skeleton className='w-[250px] h-[8px] rounded' />
                                </div>
                            ) : (
                                <p className='text-sm'>
                                    Finished
                                </p>
                            )}
                        </React.Fragment>
                    )}
                </div>

                {gamesWithDrops.size > 0 ? (
                    <StopButton setActivePage={setActivePage} gamesWithDrops={gamesWithDrops} isMountedRef={isMountedRef} abortControllerRef={abortControllerRef} screen={'card-farming'} />
                ) : (
                    <React.Fragment>
                        {!isComplete ? (
                            <div className='flex justify-center flex-col items-center h-[100px] gap-4'>
                                <Spinner label={<p className='text-xs'>This may take a minute</p>} />
                                <Button size='sm' className='bg-red-400 min-h-[30px] font-semibold text-white rounded-sm' onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div className='flex justify-center flex-col items-center h-[100px] gap-4'>
                                <div className='border border-border rounded-full inline-block p-2 w-fit'>
                                    <IoCheckmark className='text-green-400' fontSize={50} />
                                </div>
                                <Button size='sm' className='bg-red-400 min-h-[30px] font-semibold text-white rounded-sm' onClick={handleCancel}>
                                    Back
                                </Button>
                            </div>
                        )}
                    </React.Fragment>
                )}

                {gamesWithDrops.size > 0 ? (
                    <div className='grid grid-cols-3 gap-2 max-h-[170px] border border-border rounded p-2 overflow-y-auto'>
                        {[...Array.from(gamesWithDrops)].map((item) => (
                            <div key={item.appId} className='flex gap-1 border border-border rounded p-1'>
                                <Image
                                    className='rounded object-cover'
                                    src={`https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${item.appId}/${item.icon}.jpg`}
                                    width={32}
                                    height={36}
                                    alt={`${item.name} image`}
                                    priority={true}
                                />

                                <div className='flex flex-col px-2'>
                                    <p className='text-sm font-semibold'>{item.appName}</p>
                                    <p className='text-xs'>{item.appId}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <React.Fragment>
                        {!isComplete && (<Skeleton className='w-[250px] h-[38px] rounded' />)}
                    </React.Fragment>
                )}

                <p className='text-xs text-[#797979] dark:text-[#4f4f4f]'>
                    A max of 30 games can be idled at once
                </p>
            </div>
        </React.Fragment >
    );
}