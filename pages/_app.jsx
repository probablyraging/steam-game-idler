import { NextUIProvider } from '@nextui-org/react';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
    return (
        <NextUIProvider>
            <Component {...pageProps} />
        </NextUIProvider>
    );
}