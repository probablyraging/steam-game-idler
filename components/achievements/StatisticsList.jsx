import React, { useEffect } from 'react';
import { Input } from '@nextui-org/react';

export default function StatisticsList({ statisticsUnavailable, statisticsList, userGameStatsMap, setInitialStatValues, newStatValues, setNewStatValues }) {
    useEffect(() => {
        const initialValues = {};
        if (statisticsList) {
            statisticsList.forEach(item => {
                initialValues[item.name] = userGameStatsMap.get(item.name) || 0;
            });
        }
        setInitialStatValues(initialValues);
        setNewStatValues(prevValues => {
            return Object.keys(prevValues).length === 0 ? initialValues : prevValues;
        });
    }, [statisticsList, userGameStatsMap]);

    const handleInputChange = (name, value) => {
        const numericalValue = value.replace(/\D/g, '');
        setNewStatValues(prevValues => ({
            ...prevValues,
            [name]: numericalValue
        }));
    };

    return (
        <React.Fragment>
            <div className='flex flex-col gap-2 w-full overflow-y-auto scroll-smooth p-2'>
                {statisticsUnavailable ? (
                    <div className='flex justify-center items-center w-full'>
                        <p className='text-xs'>
                            No statistics found
                        </p>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 gap-4 bg-container border border-border text-xs p-4 rounded min-h-[200px] max-h-[calc(100vh-286px)] overflow-y-auto'>
                        {statisticsList && statisticsList.map((item) => {
                            return (
                                <div key={item.name} className='flex justify-between items-center border border-border bg-[#f1f1f1] dark:bg-[#1a1a1a] p-2 rounded-sm'>
                                    {item.name}
                                    <Input
                                        size='sm'
                                        value={newStatValues[item.name]}
                                        onChange={(e) => handleInputChange(item.name, e.target.value)}
                                        className='w-[120px]'
                                        classNames={{
                                            inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-sm group-data-[focus-visible=true]:ring-transparent group-data-[focus-visible=true]:ring-offset-transparent'],
                                            input: ['text-xs']
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </React.Fragment>
    );
}