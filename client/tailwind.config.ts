// client/tailwind.config.ts
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        color: {
          1: "#1D4ED8",
          2: "#B91C1C",
          3: "#424242",
        },
      },
      flex: {
        '1/3': '1 1 33.3333%',
      },
    },
  },
  plugins: [],
}