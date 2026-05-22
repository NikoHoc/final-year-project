/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bakso: {
          primary: '#DC2626',
          secondary: '#F59E0B',
          background: '#FEF9C3',
          card: '#FFFFFF',
          text: '#1F2937',
          muted: '#9CA3AF',
        }
      }
    },
  },
  plugins: [],
};
