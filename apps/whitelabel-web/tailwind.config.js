/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme"

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary - Glider.Fi green
        primary: {
          50: '#E6FFF9',
          100: '#B3FFE9',
          200: '#80FFD9',
          300: '#4DFFC9',
          400: '#1AFFB9',
          500: '#00D9A3',
          600: '#00B88A',
          700: '#009770',
          800: '#007657',
          900: '#00553D',
        },

        // Production-grade grays (Standard pattern)
        gray: {
          DEFAULT: '#F2F2F2',
          25: '#F2F2F2',
          50: '#F7F7F7',
          100: '#E3E3E3',
          150: '#D9D9D9',
          200: '#C8C8C8',
          300: '#BDBDBD',
          400: '#B2B2B2',
          500: '#949494',
          600: '#858585',
          700: '#7C7C7C',
          800: '#555555',
          900: '#3A3A3A',
          925: '#313131',
          950: '#262626',
        },

        // Secondary
        secondary: {
          DEFAULT: '#1D1D1B',
          active: '#333331',
          hover: '#555555',
          50: '#F2F2F1',
          100: '#D9D9D8',
          200: '#BFBFBE',
          300: '#A6A6A5',
        },

        // Background
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#1F1F21',
        },

        // Success
        success: {
          DEFAULT: '#2E7D32',
          background: '#EDF7ED',
          hover: '#3ED675',
          active: '#32CC6A',
          darken: '#26BE5D',
        },

        // Warning
        warning: {
          DEFAULT: '#EF6C00',
          background: '#FFF4E5',
          hover: '#F5E500',
          active: '#EFDF00',
          darken: '#f5bc0f',
        },

        // Error
        error: {
          DEFAULT: '#D32F2F',
          background: '#FDEDED',
          hover: '#E33837',
          active: '#D52B2A',
          darken: '#C82221',
        },

        // Number colors (for APY, returns)
        number: {
          positive: '#40B66B',
          negative: '#FF5F52',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        urbanist: ['Urbanist', ...defaultTheme.fontFamily.sans],
      },

      fontSize: {
        '2xs': ['10px', '12px'],
        ...defaultTheme.fontSize,
        xs: ['12px', '14px'],
        sm: ['14px', '16px'],
        base: ['16px', '18px'],
        lg: ['18px', '22px'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

