/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#c6d6fe',
          300: '#9db8fd',
          400: '#6d91fb',
          500: '#4f69f8', // Core Primary
          600: '#3e4bec',
          700: '#343dc9',
          800: '#2d33a1',
          900: '#2a2f80',
          950: '#191b4b',
        },
        accent: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        slate: {
          950: '#030409',
          900: '#0a0b14',
          800: '#121421',
          700: '#1a1d2e',
          600: '#242942',
          500: '#323959',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Outfit', 'Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #4f69f8 0%, #9333ea 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
        'mesh-glow': 'radial-gradient(circle at 50% 50%, rgba(79, 105, 248, 0.15) 0%, transparent 50%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(79, 105, 248, 0.4)',
        'glow-accent': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-lg': '0 0 40px rgba(79, 105, 248, 0.25)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'spin-slow': 'spin 12s linear infinite',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(150px) rotate(0deg)' },
          to: { transform: 'rotate(360deg) translateX(150px) rotate(-360deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
