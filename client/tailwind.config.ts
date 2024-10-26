/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        color:{
          1: "#1D4ED8",
          2: "#B91C1C",
          3: "#424242",
        }
      },

    },
  },
  plugins: [],
}

