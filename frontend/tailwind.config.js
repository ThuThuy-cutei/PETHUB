/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef3e2",
          100: "#fde4b9",
          200: "#fcd48c",
          300: "#fbc35f",
          400: "#fab63d",
          500: "#f9a825",
          600: "#f59d21",
          700: "#ef901c",
          800: "#e98318",
          900: "#df6e11",
        },
        pet: {
          dog: "#8B4513",
          cat: "#FF6B6B",
          bird: "#4ECDC4",
          hamster: "#FFE66D",
          rabbit: "#A8E6CF",
        },
      },
    },
  },
  plugins: [],
};
