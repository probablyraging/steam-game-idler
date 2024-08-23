import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            width: {
                'calc': 'calc(100vw - 62px)'
            },
            height: {
                'calc': 'calc(100vh - 62px)',
                'loader': 'calc(100vh - 154px)'
            },
            maxHeight: {
                'calc': 'calc(100vh - 62px)',
            },
            minHeight: {
                'calc': 'calc(100vh - 62px)',
            },
            boxShadow: {
                'soft-lg': '0 30px 60px 0 #00000020',
            },
        }
    },
    darkMode: 'class',
    plugins: [nextui({
        themes: {
            light: {
                colors: {
                    'sgi': '#137eb5',
                    'offwhite': '#ffffff',
                    'sidebar': '#1a8fcb',
                    'titlebar': '#efefef',
                    'titletext': '#0a0a0a',
                    'titlehover': '#dddddd',
                    'titleborder': '#00000015',
                    'base': '#fafafa',
                    'container': '#f7f7f7',
                    'containerhover': '#efefef',
                    'border': '#00000015',
                    'borderhover': '#00000025',
                    'input': '#f7f7f7',
                    'inputborder': '#00000015',
                    'link': '#5a95d3',
                    'linkhover': '#4b82bb',
                    'favorite': '#e9e9e9',
                    'favoriteicon': '#56c6ff',
                    'favoritehover': '#d1d1d1',
                    primary: {
                        DEFAULT: '#000',
                        foreground: '#fff'
                    },
                    secondary: {
                        DEFAULT: '#137eb5',
                    }
                }
            },
            dark: {
                colors: {
                    'sgi': '#137eb5',
                    'offwhite': '#ebebeb',
                    'sidebar': '#1a8fcb',
                    'titlebar': '#1c1c1c',
                    'titletext': '#efefef',
                    'titlehover': '#2b2b2b',
                    'titleborder': '#ffffff15',
                    'base': '#141414',
                    'container': '#161616',
                    'containerhover': '#252525',
                    'border': '#ffffff15',
                    'borderhover': '#ffffff25',
                    'input': '#181818',
                    'inputborder': '#ffffff15',
                    'link': '#5a95d3',
                    'linkhover': '#4b82bb',
                    'favorite': '#333',
                    'favoriteicon': '#56c6ff',
                    'favoritehover': '#414141',
                    primary: {
                        DEFAULT: '#fff',
                        foreground: '#000'
                    },
                    secondary: {
                        DEFAULT: '#137eb5',
                    }
                }
            },
        }
    })],
};
