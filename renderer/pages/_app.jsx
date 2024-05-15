import React from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider } from '../components/theme/theme-provider';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
    return (
        <NextUIProvider className='h-full'>
            <ThemeProvider
                attribute='class'
                themes={['light', 'dark']}
                enableSystem={true}
                defaultTheme='system'
                disableTransitionOnChange
            >
                <Component {...pageProps} />
            </ThemeProvider>
        </NextUIProvider>
    );
}