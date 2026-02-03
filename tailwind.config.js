/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#AD1457', // Deep Raspberry
                    50: '#FCE4EC',
                    100: '#F8BBD0',
                    200: '#F48FB1',
                    300: '#F06292',
                    400: '#EC407A',
                    500: '#E91E63',
                    600: '#D81B60',
                    700: '#C2185B',
                    800: '#AD1457',
                    900: '#880E4F',
                },
                secondary: {
                    DEFAULT: '#D4AF37', // Gold/Bronze
                    50: '#FFF8E1',
                    100: '#FFECB3',
                    200: '#FFE082',
                    300: '#FFD54F',
                    400: '#FFCA28',
                    500: '#FFC107',
                    600: '#FFB300',
                    700: '#FFA000',
                    800: '#FF8F00',
                    900: '#FF6F00',
                },
                accent: {
                    DEFAULT: '#26A69A', // Teal/Mint (Sophisticated accent)
                    50: '#E0F2F1',
                    100: '#B2DFDB',
                    200: '#80CBC4',
                    300: '#4DB6AC',
                    400: '#26A69A',
                    500: '#009688',
                    600: '#00897B',
                    700: '#00796B',
                    800: '#00695C',
                    900: '#004D40',
                },
                success: {
                    DEFAULT: '#43A047',
                    50: '#E8F5E9',
                    100: '#C8E6C9',
                    200: '#A5D6A7',
                    300: '#81C784',
                    400: '#66BB6A',
                    500: '#4CAF50',
                    600: '#43A047',
                    700: '#388E3C',
                    800: '#2E7D32',
                    900: '#1B5E20',
                },
                cream: '#FAFAFA', // Off-white, cleaner than yellow-cream
                chocolate: '#3E2723',
                // Updated elegant palette
                magenta: '#C2185B',
                coral: '#D84315',
                mango: '#FFA000',
                berry: '#7B1FA2',
                mint: '#00796B',
                raspberry: '#880E4F',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Playfair Display', 'Georgia', 'serif'], // Serif for headings
                bold: ['Montserrat', 'Arial', 'sans-serif'], // Clean sans-serif for bold text
            },
            borderRadius: {
                lg: '0.5rem',
                md: '0.375rem',
                sm: '0.25rem',
            },
            keyframes: {
                'cart-fly': {
                    '0%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
                    '50%': { transform: 'translate(50%, -50%) scale(0.8)', opacity: '0.8' },
                    '100%': { transform: 'translate(100%, -100%) scale(0.3)', opacity: '0' },
                },
                'slide-in-right': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'slide-in-left': {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'slide-in-up': {
                    '0%': { transform: 'translateY(100px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-in-down': {
                    '0%': { transform: 'translateY(-100px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-down': {
                    '0%': { opacity: '0', transform: 'translateY(-30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'bounce-in': {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'zoom-in': {
                    '0%': { transform: 'scale(0.5)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-30px) rotate(5deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 157, 0.4)' },
                    '50%': { boxShadow: '0 0 40px rgba(255, 107, 157, 0.8)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'spin-slow': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                'wiggle': {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                'blob': {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                'marquee': {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                'reveal-up': {
                    '0%': { clipPath: 'inset(100% 0 0 0)', opacity: '0' },
                    '100%': { clipPath: 'inset(0 0 0 0)', opacity: '1' },
                },
                'scale-up': {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'sparkle': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.5', transform: 'scale(0.8)' },
                },
            },
            animation: {
                'cart-fly': 'cart-fly 0.6s ease-out',
                'slide-in-right': 'slide-in-right 0.5s ease-out',
                'slide-in-left': 'slide-in-left 0.5s ease-out',
                'slide-in-up': 'slide-in-up 0.6s ease-out',
                'slide-in-down': 'slide-in-down 0.6s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'fade-in-up': 'fade-in-up 0.6s ease-out',
                'fade-in-down': 'fade-in-down 0.6s ease-out',
                'bounce-in': 'bounce-in 0.4s ease-out',
                'zoom-in': 'zoom-in 0.5s ease-out',
                'float': 'float 3s ease-in-out infinite',
                'float-slow': 'float-slow 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'spin-slow': 'spin-slow 20s linear infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
                'blob': 'blob 7s infinite',
                'marquee': 'marquee 25s linear infinite',
                'reveal-up': 'reveal-up 0.8s ease-out',
                'scale-up': 'scale-up 0.5s ease-out',
                'sparkle': 'sparkle 2s ease-in-out infinite',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
