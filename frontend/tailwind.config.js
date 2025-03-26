/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        custompink: '#F0CBF0', // Corrected indentation
      },
      animation: {
        blink: 'blink-animation 1s steps(5, start) infinite',
      },
      keyframes: {
        'blink-animation': {
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
