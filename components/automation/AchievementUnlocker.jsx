import React, { useState, useEffect, useRef } from 'react';
import StopButton from './StopButton';
import { Button, Spinner } from '@nextui-org/react';
import { logEvent, startIdler, stopIdler, unlockAchievement } from '@/utils/utils';
import { IoCheckmark } from 'react-icons/io5';

export default function AchievementUnlocker({ setActivePage }) {
    const isMountedRef = useRef(true);
    const abortControllerRef = useRef(new AbortController());
    const [hasPrivateGames, setHasPrivateGames] = useState(false);
    const [achievementCount, setAchievementCount] = useState(0);
    const [currentGame, setCurrentGame] = useState('');
    const [gamesWithAchievements, setGamesWithAchievements] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [countdownTimer, setCountdownTimer] = useState('');

    useEffect(() => {
        const startAchievementUnlocker = async () => {
            try {
                const achievementUnlocker = JSON.parse(localStorage.getItem('achievementUnlocker')) || [];

                if (achievementUnlocker.length < 1) {
                    logEvent('[Achievement Unlocker - Auto] No games left - stopping');
                    stopIdler(currentGame.appId);
                    setGamesWithAchievements(0);
                    setIsComplete(true);
                    return;
                }

                const { achievements, game } = await fetchAchievements(achievementUnlocker[0]);

                if (achievements.length > 0) {
                    await unlockAchievements(achievements, game);
                }

                removeGameFromUnlockerList(game.game.id);

                if (isMountedRef.current) {
                    startAchievementUnlocker();
                }
            } catch (error) {
                console.log('Error in achievement unlocker:', error);
                logEvent(`[Error] [Achievement Unlocker - Auto] ${error}`);
            }
        };

        const abortController = abortControllerRef.current;

        startAchievementUnlocker();

        return () => {
            isMountedRef.current = false;
            abortController.abort();
        };
    }, []);

    const fetchAchievements = async (gameData) => {
        const game = JSON.parse(gameData);
        const userSummary = JSON.parse(localStorage.getItem('userSummary')) || {};

        setCurrentGame({ appId: game.game.id, name: game.game.name });

        const [userAchievementsResponse, gameAchievementsResponse] = await Promise.all([
            fetch('https://apibase.vercel.app/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-achievements', steamId: userSummary.steamId, appId: game.game.id }),
            }),
            fetch('https://apibase.vercel.app/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'game-achievement-percentage', appId: game.game.id }),
            })
        ]);

        if (userAchievementsResponse.status === 500 || gameAchievementsResponse.status === 500) {
            setHasPrivateGames(true);
            return { achievements: [], game };
        }

        const userAchievements = await userAchievementsResponse.json();
        const gameAchievements = await gameAchievementsResponse.json();

        const achievements = userAchievements.achievements
            .filter(achievement => !achievement.unlocked)
            .map(achievement => {
                const percentageData = gameAchievements.find(a => a.name === achievement.name);
                return {
                    appId: game.game.id,
                    name: achievement.name,
                    gameName: userAchievements.game,
                    percentage: percentageData ? percentageData.percent : null
                };
            })
            .sort((a, b) => b.percentage - a.percentage);

        setAchievementCount(achievements.length);
        setGamesWithAchievements(achievements.length);

        return { achievements, game };
    };

    const unlockAchievements = async (achievements) => {
        const settings = JSON.parse(localStorage.getItem('settings')) || {};
        const { interval, idle } = settings.achievementUnlocker;

        if (idle) {
            startIdler(achievements[0].appId, achievements[0].gameName, false);
        }

        for (const achievement of achievements) {
            if (isMountedRef.current) {
                unlockAchievement(achievement.appId, achievement.name, true);
                logEvent(`[Achievement Unlocker - Auto] Unlocked ${achievement.name} for ${achievement.gameName}`);
                setAchievementCount(prevCount => Math.max(prevCount - 1, 0));
                const randomDelay = getRandomDelay(interval[0], interval[1]);
                startCountdown(randomDelay / 60000);
                await delay(randomDelay);
            }
        }
    };

    const removeGameFromUnlockerList = (gameId) => {
        const achievementUnlocker = JSON.parse(localStorage.getItem('achievementUnlocker')) || [];
        const updatedAchievementUnlocker = achievementUnlocker.filter(arr => JSON.parse(arr).game.id !== gameId);
        localStorage.setItem('achievementUnlocker', JSON.stringify(updatedAchievementUnlocker));
    };

    const startCountdown = (durationInMinutes) => {
        const durationInMilliseconds = durationInMinutes * 60000;
        let remainingTime = durationInMilliseconds;

        const intervalId = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(intervalId);
                return;
            }

            setCountdownTimer(formatTime(remainingTime));
            remainingTime -= 1000;
        }, 1000);
    };

    const delay = (ms) => {
        return new Promise((resolve, reject) => {
            const checkInterval = 1000;
            let elapsedTime = 0;

            const intervalId = setInterval(() => {
                if (!isMountedRef.current) {
                    clearInterval(intervalId);
                    reject(new DOMException('Achievement unlocking stopped early', 'Stop'));
                } else if (elapsedTime >= ms) {
                    clearInterval(intervalId);
                    resolve();
                }
                elapsedTime += checkInterval;
            }, checkInterval);

            abortControllerRef.current.signal.addEventListener('abort', () => {
                clearInterval(intervalId);
                reject(new DOMException('Achievement unlocking stopped early', 'Stop'));
            });
        });
    };

    const formatTime = (ms) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const getRandomDelay = (min, max) => {
        return Math.floor(Math.random() * ((max - min) * 60 * 1000 + 1)) + min * 60 * 1000;
    };

    const handleCancel = () => {
        isMountedRef.current = false;
        abortControllerRef.current.abort();
        setActivePage('games');
        stopIdler(currentGame.appId);
    };

    return (
        <React.Fragment>
            <div className='flex justify-evenly items-center flex-col p-4 w-full h-calc'>
                <div className='flex items-center flex-col'>
                    <p className='text-3xl font-semibold mb-2'>
                        Achievement Unlocker
                    </p>
                    {hasPrivateGames ? (
                        <div className='flex flex-col items-center gap-2 text-xs'>
                            <p>Your games list must be set to <span className='font-bold'>public</span> in order for Achievement Unlocker to work</p>
                            <p>To change your privacy settings go to <span className='font-bold'>Steam &gt; Profile &gt; Edit Profile &gt; Privacy Settings &gt; Game Details &gt; Public</span></p>
                            <p>It may take up to 5 minutes for the changes to be applied</p>

                            <Button size='sm' className='bg-red-400 min-h-[30px] font-semibold text-offwhite rounded-sm' onClick={handleCancel}>
                                Back
                            </Button>
                        </div>
                    ) : (
                        <React.Fragment>
                            {!isComplete ? (
                                <React.Fragment>
                                    <p className='text-sm'>
                                        Unlocking <span className='font-bold text-sgi'>{achievementCount}</span> achievement(s) for <span className='font-bold text-sgi '>{currentGame.name}</span>
                                    </p>
                                </React.Fragment>
                            ) : (
                                <p className='text-sm'>
                                    Finished
                                </p>
                            )}

                            {gamesWithAchievements > 0 ? (
                                <StopButton setActivePage={setActivePage} isMountedRef={isMountedRef} abortControllerRef={abortControllerRef} screen={'achievement-unlocker'} currentGame={currentGame} />
                            ) : (
                                <React.Fragment>
                                    {!isComplete ? (
                                        <div className='flex justify-center flex-col items-center h-[100px] gap-4'>
                                            <Spinner label={<p className='text-xs'>This may take a minute</p>} />
                                            <Button size='sm' className='bg-red-400 min-h-[30px] font-semibold text-offwhite rounded-sm' onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className='flex justify-center flex-col items-center h-[100px] gap-4 mt-4'>
                                            <div className='border border-border rounded-full inline-block p-2 w-fit'>
                                                <IoCheckmark className='text-green-400' fontSize={50} />
                                            </div>
                                            <Button size='sm' className='bg-red-400 min-h-[30px] font-semibold text-offwhite rounded-sm' onClick={handleCancel}>
                                                Back
                                            </Button>
                                        </div>
                                    )}
                                </React.Fragment>
                            )}

                            {!isComplete && (
                                <p className='text-sm'>
                                    Next unlock in <span className='font-bold text-sgi'>{countdownTimer}</span>
                                </p>
                            )}
                        </React.Fragment>
                    )}
                </div>
            </div>
        </React.Fragment >
    );
};