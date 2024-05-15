import { nextui } from '@nextui-org/theme';

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './renderer/pages/**/*.{js,ts,jsx,tsx}',
        './renderer/components/**/*.{js,ts,jsx,tsx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {}
        },
    },
    darkMode: 'class',
    plugins: [nextui({
        themes: {
            light: {
                colors: {
                    'dull': '#000',
                    'accent': '#fff',
                    'pop': '#171717',
                    'base': '#fafafa',
                    'base-hover': '#f7f7f7',
                    'tooltip': '#fafafa',
                    'light-border': '#00000020',
                    'hover-border': '#00000030',
                    'btn': '#F4F4F5',
                    'btn-hover': '#dddddd',
                    'btn-active': '#f3f3f3',
                    'link': '#666',
                    'link-hover': '#000',
                }
            },
            dark: {
                colors: {
                    'dull': '#adadad',
                    'accent': '#fff',
                    'pop': '#ededed',
                    'base': '#0b0b0b',
                    'base-hover': '#141414',
                    'tooltip': '#1a1a1a',
                    'light-border': '#ffffff20',
                    'hover-border': '#ffffff40',
                    'btn': '#262626',
                    'btn-hover': '#393838',
                    'btn-active': '#1f1f1f',
                    'link': '#888',
                    'link-hover': '#fff',
                }
            },
        }
    })],
};
