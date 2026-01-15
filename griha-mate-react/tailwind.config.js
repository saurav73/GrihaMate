/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sapphire Veil Palette
        primary: {
          lightest: '#E7F0FA',
          light: '#7BA4D0',
          DEFAULT: '#2E5E99',
          dark: '#0D2440',
        },
        sapphire: {
          50: '#E7F0FA',
          100: '#D4E5F7',
          200: '#A9CBF0',
          300: '#7BA4D0',
          400: '#5789BA',
          500: '#2E5E99',
          600: '#254A7D',
          700: '#1C3860',
          800: '#142744',
          900: '#0D2440',
          950: '#071323',
        },
        // Keep utility colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2E5E99 0%, #0D2440 100%)',
        'gradient-light': 'linear-gradient(135deg, #E7F0FA 0%, #7BA4D0 100%)',
        'gradient-overlay': 'linear-gradient(180deg, rgba(14, 36, 64, 0.8) 0%, rgba(46, 94, 153, 0.9) 100%)',
      },
      borderColor: {
        DEFAULT: '#E7F0FA',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

