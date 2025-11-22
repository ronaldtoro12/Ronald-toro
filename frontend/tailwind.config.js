/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a2332',
        secondary: '#2d3e50',
        accent: '#3dd6a7',
        accentDark: '#2ab88a',
      },
    },
  },
  plugins: [],
}