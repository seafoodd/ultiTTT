import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import postcssConfig from "./postcss.config";

config();

export default defineConfig({
  base: '/',
  server: {
    // host: "192.168.0.100",
    // port: 8000,
    open: true,
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
  plugins: [react()],
  css: {
    postcss: postcssConfig,
  },
});
