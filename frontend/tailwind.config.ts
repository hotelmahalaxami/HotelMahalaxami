import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#153D35',
          50: '#F3F7F5',
          100: '#E3ECE8',
          200: '#C4D7CE',
          300: '#9FBDB0',
          400: '#6A9986',
          500: '#3B7462',
          600: '#23594B',
          700: '#1B4A3E',
          800: '#153D35',
          900: '#102F29',
          950: '#0A1E1A',
        },
        primary: {
          DEFAULT: '#153D35',
          50: '#F3F7F5',
          100: '#E3ECE8',
          200: '#C4D7CE',
          300: '#9FBDB0',
          400: '#6A9986',
          500: '#3B7462',
          600: '#23594B',
          700: '#1B4A3E',
          800: '#153D35',
          900: '#102F29',
          950: '#0A1E1A',
        },
        ivory: {
          DEFAULT: '#F7F5EF',
          50: '#FCFBF8',
          100: '#F7F5EF',
          200: '#EFECE1',
          300: '#E3DFCF',
          400: '#D1CCB7',
        },
        terracotta: {
          DEFAULT: '#C96F43',
          50: '#FDF6F2',
          100: '#FBECE3',
          200: '#F5D3C1',
          300: '#EDB397',
          400: '#DC8E67',
          500: '#C96F43',
          600: '#B8582B',
          700: '#96431E',
          800: '#79371B',
          900: '#632F1A',
        },
        pos: {
          text: '#20332F',
          muted: '#64746E',
          border: '#E3E5DE',
          surface: '#FFFFFF',
          bg: '#F7F5EF',
        },
        brand: {
          50: '#FDF6F2',
          100: '#FBECE3',
          200: '#F5D3C1',
          300: '#EDB397',
          400: '#DC8E67',
          500: '#C96F43',
          600: '#B8582B',
          700: '#96431E',
          800: '#79371B',
          900: '#632F1A',
          950: '#421D0E',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          light: '#F7F5EF',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Georgia', 'serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(21, 61, 53, 0.05), 0 1px 2px -1px rgba(21, 61, 53, 0.05)',
        card: '0 4px 6px -1px rgba(21, 61, 53, 0.05), 0 2px 4px -2px rgba(21, 61, 53, 0.05)',
        elevated: '0 10px 15px -3px rgba(21, 61, 53, 0.08), 0 4px 6px -4px rgba(21, 61, 53, 0.04)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 3.5s ease-in-out infinite',
        'float-delayed': 'float 3.5s ease-in-out 1.5s infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s infinite linear',
      },
    },
  },
  plugins: [],
};

export default config;
