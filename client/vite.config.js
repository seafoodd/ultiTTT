import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {config} from 'dotenv'

config()

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "192.168.0.100",
    port: 8000, // Change this to your desired port number
  },
  plugins: [react()],
})
