import React from 'react';
import Head from 'next/head';
import { GeistSans } from 'geist/font/sans';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from 'next-themes';

export default function Layout({ children }) {
    const { theme } = useTheme();

    return (
        <React.Fragment>
            <Head>
                <title>Steam Game Idler</title>
            </Head>

            <main className={`${GeistSans.className} h-full min-h-screen bg-base rounded-tr-[10px] rounded-tl-xl`}>
                {children}
            </main>
            <ToastContainer
                toastStyle={{ fontSize: 12 }}
                position='top-center'
                theme={theme}
                transition={Slide}
                pauseOnFocusLoss={false}
                limit={1}
                pauseOnHover={false}
                newestOnTop
                autoClose={1500}
            />
        </React.Fragment>
    );
}