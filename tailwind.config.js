/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0a0a0a',
        surface: '#141414',
        accent: '#e5e5e5',
      },
    },
  },
  plugins: [],
}
