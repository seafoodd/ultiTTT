import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import postcssConfig from "./postcss.config";

config();

export default defineConfig({
  server: {
    host: "192.168.0.100",
    port: 8000,
  },
  plugins: [react()],
  css: {
    postcss: postcssConfig,
  },
});
