/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        xbox: {
          50: '#e8f5e8',
          100: '#c6e6c6',
          200: '#9ed8a0',
          300: '#6cc56f',
          400: '#3eb043',
          500: '#107C10',
          600: '#0e6b0e',
          700: '#0a520a',
          800: '#073d07',
          900: '#052905',
        },
      },
      fontFamily: {
        heading: ['Rajdhani', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(16, 124, 16, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(16, 124, 16, 0.7)' },
        },
      },
    },
  },
  plugins: [],
};
