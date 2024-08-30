import React, { useEffect, useState } from 'react';
import { Input } from '@nextui-org/react';
import { updateStat } from '@/utils/utils';
import { toast } from 'react-toastify';

export default function StatisticsList({ appId, appName, statisticsUnavailable, statisticsList, userGameStatsMap }) {
    const [inputValues, setInputValues] = useState({});

    useEffect(() => {
        const initialValues = {};
        if (statisticsList) {
            statisticsList.forEach(item => {
                initialValues[item.name] = userGameStatsMap.get(item.name) || 0;
            });
        }
        setInputValues(initialValues);
    }, [statisticsList, userGameStatsMap]);

    const handleInputChange = (name, value) => {
        setInputValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

    const handleUpdate = async (statName) => {
        const status = await updateStat(appId, statName, inputValues[statName].toString());
        if (!status.error) {
            toast.success(`Updated ${statName} to ${inputValues[statName]} for ${appName}`, { autoClose: 1500 });
        } else {
            toast.error(`Error: ${status.error}`);
        }
    };

    return (
        <React.Fragment>
            <div className='flex flex-col gap-2 w-full overflow-y-auto scroll-smooth'>
                {statisticsUnavailable ? (
                    <div className='flex justify-center items-center w-full'>
                        <p className='text-xs'>
                            No statistics found
                        </p>
                    </div>
                ) : (
                    <div className='bg-container border border-border text-xs rounded min-h-[200px] max-h-[calc(100vh-270px)] overflow-y-auto'>
                        <table className='w-full border-collapse'>
                            <thead className='sticky top-0 z-10'>
                                <tr className='border-b border-border bg-container'>
                                    <th className='text-left p-1.5 w-1/2'>Name</th>
                                    <th className='text-left p-1.5 w-full'>Value</th>
                                    <th className='text-left p-1.5'></th>
                                </tr>
                            </thead>
                            <tbody>
                                {statisticsList && statisticsList.map((item, index) => {
                                    return (
                                        <tr key={item.name} className={index % 2 === 0 ? 'bg-container' : 'bg-[#f1f1f1] dark:bg-[#1a1a1a]'}>
                                            <td className='p-1.5'>
                                                {item.name}
                                            </td>
                                            <td className='p-1.5'>
                                                <Input
                                                    type='number'
                                                    size='sm'
                                                    value={inputValues[item.name] || 0}
                                                    onChange={(e) => handleInputChange(item.name, e.target.value)}
                                                    className='w-[70px]'
                                                    classNames={{
                                                        inputWrapper: ['bg-input border border-inputborder hover:!bg-titlebar rounded-sm group-data-[focus-visible=true]:ring-transparent group-data-[focus-visible=true]:ring-offset-transparent'],
                                                        input: ['text-xs']
                                                    }}
                                                />
                                            </td>
                                            <td className='p-1.5 px-3'>
                                                <div
                                                    className='flex justify-center items-center w-[30px] h-[30px] cursor-pointer group'
                                                    onClick={() => handleUpdate(item.name)}
                                                >
                                                    <div className='bg-sgi group-hover:bg-opacity-85 py-1 px-2 rounded-sm text-xs text-offwhite font-semibold mr-6 duration-200'>
                                                        <p>Update</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
}