/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#F9F8F6', // Warm Ivory
                charcoal: '#1C1C1A',   // Deep Charcoal
                slate: '#8E8E8E',      // Slate Gray
                white: '#FFFFFF',      // Pure White
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
                serif: ['Newsreader', 'Cormorant Garamond', 'serif'],
                mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
            },
            backgroundImage: {
                'dotted-pattern': 'url("/dotted-pattern.svg")',
            }
        },
    },
    plugins: [],
}
