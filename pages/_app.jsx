import { ThemeProvider } from '@/components/theme/theme-provider';
import { NextUIProvider } from '@nextui-org/react';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider
            attribute='class'
            themes={['light', 'dark']}
            enableSystem={true}
            defaultTheme='system'
            disableTransitionOnChange
        >
            <NextUIProvider>
                <Component {...pageProps} />
            </NextUIProvider>
        </ThemeProvider>
    );
}