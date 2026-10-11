/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        da: {
          DEFAULT: '#0D9488',
          dark: '#0B7C72',
          light: '#F0FDFA',
        },
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#0D9488',
          600: '#0B7C72',
          700: '#0F766E',
        },
      },
    },
  },
  plugins: [],
}
