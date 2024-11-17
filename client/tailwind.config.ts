// client/tailwind.config.ts
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        color: {
          symbols: {
            x: "#1D4ED8",
            o: "#B91C1C",
            tie: "#636363",
          },
          blue: {
            1: "#1D4ED8",
          },
          red: {
            1: "#B91C1C",
          },
          green: {
            1: "#2ac367",
          },
          gray: {
            1: "#1B202C",
            2: "#0e1017",
            3: "#636363",
          },
        },
      },
      flex: {
        "1/3": "1 1 33.3333%",
      },
    },
  },
  plugins: [],
};
