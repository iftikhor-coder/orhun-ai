import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        midnight: {
          950: '#06091a',
          900: '#0a0e1a',
          800: '#0f1428',
          700: '#131829',
          600: '#1a2138',
          500: '#1f2942',
          400: '#2a3552',
        },
        gold: {
          50: '#fdf8eb',
          100: '#faedc4',
          200: '#f5dc91',
          300: '#e6c068',
          400: '#d4a93f',
          500: '#c9a44c',
          600: '#a8842f',
          700: '#7d6020',
          800: '#5a4516',
          900: '#3d2f0e',
        },
      },
      backgroundImage: {
        'gradient-midnight': 'radial-gradient(ellipse at top, #131829 0%, #06091a 100%)',
        'gradient-gold': 'linear-gradient(135deg, #e6c068 0%, #c9a44c 50%, #a8842f 100%)',
        'gradient-gold-soft': 'linear-gradient(135deg, rgba(230,192,104,0.15) 0%, rgba(201,164,76,0.1) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,164,76,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201,164,76,0.6)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
