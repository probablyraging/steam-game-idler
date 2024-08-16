import React from 'react';
import { IoStop } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { stopIdler } from '@/utils/utils';

export default function StopButton({ setActivePage, isMountedRef, abortControllerRef, gamesWithDrops, screen, currentGame }) {
    const borderWidths = [
        ...Array.from({ length: 500 }, (_, i) => 0.5 + i * 0.01),
        ...Array.from({ length: 500 }, (_, i) => 6 - i * 0.01),
    ];

    const handleStop = () => {
        if (screen === 'card-farming') {
            for (const game of gamesWithDrops) {
                stopIdler(game.appId);
            }
            isMountedRef.current = false;
            abortControllerRef.current.abort();
            setActivePage('games');
        } else {
            isMountedRef.current = false;
            abortControllerRef.current.abort();
            setActivePage('games');
            stopIdler(currentGame.appId);
        }
    };

    return (
        <React.Fragment>
            <div className='flex justify-center items-center w-[100px] h-[100px]'>
                <motion.div
                    animate={{
                        borderWidth: borderWidths,
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className='border border-border rounded-full inline-block p-2 w-fit'
                >
                    <IoStop className='text-red-400 hover:opacity-90 duration-200 cursor-pointer' fontSize={50} onClick={() => handleStop()} />
                </motion.div>
            </div>
        </React.Fragment>
    );
}