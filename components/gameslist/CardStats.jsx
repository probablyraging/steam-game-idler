import React from 'react';
import { minutesToHoursCompact } from '@/utils/utils';
import moment from 'moment';
import { Divider } from '@nextui-org/react';

export default function CardStats({ item }) {
    return (
        <React.Fragment>
            <div className='flex flex-col gap-2 my-1'>
                <Divider className='w-full h-[1px] bg-titleborder' />
                <div className='flex gap-1 text-xs w-fit'>
                    <p className='font-semibold'>
                        Playtime
                    </p>
                    <div>
                        {minutesToHoursCompact(item.minutes) > 1 ? (
                            <p>{minutesToHoursCompact(item.minutes).toLocaleString()} hours</p>
                        ) : minutesToHoursCompact(item.minutes) === 0 ? (
                            <p>0 hours</p>
                        ) : (
                            <p>{minutesToHoursCompact(item.minutes).toLocaleString()} hour</p>
                        )}
                    </div>
                </div>

                <div className='flex gap-1 text-xs w-fit'>
                    <p className='font-semibold'>
                        Last Played
                    </p>
                    <div>
                        {item.lastPlayedTimestamp > 0 ? (
                            <p>{moment.unix(item.lastPlayedTimestamp).format('MMM D, YYYY')}</p>
                        ) : (
                            <p>Never played</p>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}