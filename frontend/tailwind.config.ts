import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fef9ee',
          100: '#fef0d0',
          200: '#fddea1',
          300: '#fbc567',
          400: '#f9a32d',
          500: '#f78b0e',
          600: '#e77009',
          700: '#bf530a',
          800: '#98410f',
          900: '#7a3710',
          950: '#421b05',
        },
        surface: {
          DEFAULT: '#1a1a2e',
          light:   '#16213e',
          card:    '#0f3460',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
