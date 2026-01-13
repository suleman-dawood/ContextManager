/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD700',
          dark: '#FFC107',
        },
        accent: {
          yellow: '#FFD700',
          orange: '#FF8C00',
        },
        black: '#000000',
        white: '#FFFFFF',
        gray: {
          light: '#F5F5F5',
          medium: '#CCCCCC',
          dark: '#333333',
        },
        success: '#FFD700',
        warning: '#FF8C00',
        danger: '#FF8C00',
      },
      boxShadow: {
        'minor': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 8px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'sharp': '0',
      },
    },
  },
  plugins: [],
}

