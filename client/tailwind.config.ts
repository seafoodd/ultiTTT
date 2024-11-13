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
          3: "#636363",
          gray: {
            1: "#1B202C",
            2: "#0e1017",
          }
        },
      },
      flex: {
        '1/3': '1 1 33.3333%',
      },
    },
  },
  plugins: [],
}