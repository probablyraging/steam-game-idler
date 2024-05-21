import React from 'react';
import { Button } from '@nextui-org/react';
import { BsFillTrash3Fill } from "react-icons/bs";

export default function SelectedGames({ selectedGamesNames, clearSelected, startIdler }) {
    return (
        <React.Fragment>
            <div className='absolute bottom-0 right-0 m-5 z-10'>
                <div className='flex flex-col gap-4 bg-container border border-border min-w-[400px] max-w-[400px] p-4 rounded-md'>
                    <p className='text-sidebar text-lg font-bold'>
                        Selected Games
                    </p>
                    <div className='border border-border max-h-[100px] max-w-[400px] overflow-y-auto'>
                        {selectedGamesNames.map((item, index) => {
                            return (
                                <p className='truncate'>{item}</p>
                            )
                        })}
                    </div>
                    <div className='flex gap-2 w-full'>
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
                            color='danger'
                            className='rounded'
                            startContent={<BsFillTrash3Fill />}
                            onClick={clearSelected}
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}