/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pokemon': ['Pokemon', 'monospace'],
      },
      colors: {
        'gameboy': {
          'light': '#9bbc0f',
          'medium': '#8bac0f',
          'dark': '#0f380f',
          'shadow': '#306230',
        },
      },
    },
  },
  plugins: [],
} 