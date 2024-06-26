import React from 'react';
import Head from 'next/head';
import { GeistSans } from 'geist/font/sans';

export default function Layout({ children }) {
    return (
        <React.Fragment>
            <Head>
                <title>Steam Game Idler</title>
            </Head>

            <main className={`${GeistSans.className} h-full min-h-screen bg-base rounded-tr-lg rounded-tl-lg`}>
                {children}
            </main>
        </React.Fragment>
    );
}