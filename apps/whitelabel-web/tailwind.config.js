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

        // Accent colors for specific states
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
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

      animation: {
        float: 'float 6s ease-in-out infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

