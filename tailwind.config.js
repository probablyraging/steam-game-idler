import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
    ],
    darkMode: 'class',
    plugins: [nextui({
        themes: {
            light: {
                colors: {
                    'dull': '#000',
                    'accent': '#fff',
                    'pop': '#171717',
                    'base': '#fafafa',
                    'base-hover': '#f5f5f5',
                    'tooltip': '#fafafa',
                    'light-border': '#00000020',
                    'hover-border': '#00000030',
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
                    'base-hover': '#0d0d0d',
                    'tooltip': '#1a1a1a',
                    'light-border': '#ffffff30',
                    'hover-border': '#ffffff40',
                    'btn-active': '#1f1f1f',
                    'link': '#888',
                    'link-hover': '#fff',
                }
            },
        }
    })],
};
