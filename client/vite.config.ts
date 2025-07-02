import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import postcssConfig from "./postcss.config";
import path from 'path'

config();

export default defineConfig({
  base: '/',
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
    host: true,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        maintenance: 'maintenance.html',
      },
    },
  },
  plugins: [react()],
  css: {
    postcss: postcssConfig,
  },
});
