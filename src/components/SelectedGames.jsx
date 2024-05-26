import React from 'react';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { BsFillTrash3Fill } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';

export default function SelectedGames({ selectedGamesNames, clearSelected, startIdler, handleClick }) {
    return (
        <React.Fragment>
            <div className='absolute bottom-0 right-0 m-5 z-10'>
                <div className='flex flex-col gap-2 bg-container border border-border min-w-[400px] max-w-[400px] p-4 rounded-md'>
                    <p className='text-sidebar text-lg font-bold'>
                        Selected Games
                    </p>
                    <div className='bg-scrolldiv border border-border max-h-[100px] max-w-[400px] overflow-y-auto rounded-md p-1'>
                        {selectedGamesNames.map((item, index) => {
                            return (
                                <div key={item.gameId}>
                                    <div
                                        className='flex justify-between items-center gap-1 p-1 cursor-pointer rounded-md hover:bg-containerhover select-none group'
                                        onClick={() => handleClick(item.gameId, item.name)}
                                    >
                                        <p className='truncate'>{item.name}</p>
                                        <div className='group-hover:bg-red-400 group-hover:text-white rounded-md p-1'>
                                            <IoMdClose />
                                        </div>
                                    </div>
                                    {index !== selectedGamesNames.length - 1 && <Divider />}
                                </div>
                            );
                        })}
                    </div>
                    <div className='flex gap-2 w-full mt-2'>
                        <Button
                            fullWidth
                            size='sm'
                            color='primary'
                            className='font-medium rounded'
                            onClick={startIdler}
                        >
                            Start Idling
                        </Button>
                        <Button
                            isIconOnly
                            size='sm'
                            className='text-white bg-red-400 rounded'
                            startContent={<BsFillTrash3Fill />}
                            onClick={clearSelected}
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}