import React from 'react';
import { BiSolidLeaf } from 'react-icons/bi';
import { FaStop } from 'react-icons/fa';

export default function IdlingState({ stopIdler }) {
    return (
        <React.Fragment>
            <div className='absolute bottom-0 right-0 m-5'>
                <div className='flex justify-between items-center gap-1 bg-container border border-border min-w-[200px] max-w-[200px] p-4 rounded-md'>
                    <div className='flex items-center gap-1'>
                        <BiSolidLeaf className='text-sgi' fontSize={26} />
                        <p>
                            Idling
                        </p>
                    </div>
                    <div className='cursor-pointer' onClick={stopIdler}>
                        <FaStop className='text-red-400 hover:opacity-80' fontSize={22} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}