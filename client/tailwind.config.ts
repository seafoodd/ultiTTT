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
            2: "#2e5ad6",
          },
          red: {
            1: "#B91C1C",
            2: "#B91C1C",
          },
          green: {
            1: "#2ac367",
            2: "#26ae4a",
          },
          black:{
            1: "#111827",
            2: "#07070f",
            3: "#040404",
          },
          gray: {
            1: "#1B202C",
            2: "#0e1017",
            3: "#636363",
            4: "#8e8e8e",
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
