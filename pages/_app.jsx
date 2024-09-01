import { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { NextUIProvider } from '@nextui-org/react';
import { debounce } from '@/utils/utils';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
    async function setupAppWindow() {
        const appWindow = (await import('@tauri-apps/api/window')).appWindow;
        const PhysicalSize = (await import('@tauri-apps/api/window')).PhysicalSize;
        const PhysicalPosition = (await import('@tauri-apps/api/window')).PhysicalPosition;

        const savedState = localStorage.getItem('windowState');

        if (savedState) {
            const { width, height, isMaximized, positionX, positionY } = JSON.parse(savedState);
            if (isMaximized) {
                await appWindow.maximize();
            } else {
                await appWindow.setSize(new PhysicalSize(width, height));
                await appWindow.setPosition(new PhysicalPosition(positionX, positionY));
            }
        }

        const saveWindowState = debounce(async () => {
            try {
                const size = await appWindow.outerSize();
                const position = await appWindow.outerPosition();
                const isMaximized = await appWindow.isMaximized();
                const windowState = {
                    width: size.width,
                    height: size.height,
                    positionX: position.x,
                    positionY: position.y,
                    isMaximized
                };
                localStorage.setItem('windowState', JSON.stringify(windowState));
            } catch (error) {
                console.error('Failed to save window state:', error);
            }
        }, 500);

        const unlistenResize = await appWindow.onResized(() => saveWindowState());
        const unlistenMove = await appWindow.onMoved(() => saveWindowState());

        return () => {
            unlistenResize();
            unlistenMove();
            saveWindowState.cancel();
        };
    };

    useEffect(() => {
        setupAppWindow();
    }, []);

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