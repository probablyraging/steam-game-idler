import { Spinner } from '@nextui-org/spinner';
import React from 'react';

export default function Loader() {
    return (
        <React.Fragment>
            <div className='flex justify-center items-center w-calc min-h-calc'>
                <Spinner color='secondary' size='lg' />
            </div>
        </React.Fragment>
    );
}