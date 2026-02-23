/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                indigo: {
                    50: '#eef2ff',
                    400: '#818cf8',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                orange: {
                    50: '#fff7ed',
                    400: '#fb923c',
                    900: '#7c2d12',
                    950: '#431407',
                },
                slate: {
                    50: '#f8fafc',
                    400: '#94a3b8',
                    700: '#334155',
                    900: '#0f172a',
                    950: '#020617',
                },
                teal: {
                    400: '#2dd4bf',
                }
            }
        },
    },
    plugins: [],
}
