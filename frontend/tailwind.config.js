/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'aurora': 'aurora 5s ease-in-out infinite',
        'aurora-wave': 'aurora-wave 5s ease-in-out infinite',
        'aurora-wave-reverse': 'aurora-wave-reverse 5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '33%': { transform: 'translate(30px, -20px) scale(1.1)', opacity: '0.5' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)', opacity: '0.4' },
        },
        'aurora-wave': {
          '0%': { transform: 'translateX(-30%) translateY(0%) scaleX(1.2)', opacity: '0.4' },
          '50%': { transform: 'translateX(30%) translateY(-8%) scaleX(1.0)', opacity: '0.7' },
          '100%': { transform: 'translateX(-30%) translateY(0%) scaleX(1.2)', opacity: '0.4' },
        },
        'aurora-wave-reverse': {
          '0%': { transform: 'translateX(30%) translateY(0%) scaleX(1.0)', opacity: '0.3' },
          '50%': { transform: 'translateX(-30%) translateY(5%) scaleX(1.3)', opacity: '0.6' },
          '100%': { transform: 'translateX(30%) translateY(0%) scaleX(1.0)', opacity: '0.3' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}