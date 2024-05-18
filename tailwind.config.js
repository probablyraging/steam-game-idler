import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
    ],
    plugins: [nextui({
        themes: {
            light: {
                colors: {
                    'sgi': '#137eb5',
                    'titlebar': '#efefef',
                    'titletext': '#0a0a0a',
                    'titlehover': '#dddddd',
                    'titleborder': '#00000015',
                    'base': '#fafafa',
                    'input': '#f7f7f7',
                    'inputborder': '#00000015',
                }
            },
        }
    })],
};
