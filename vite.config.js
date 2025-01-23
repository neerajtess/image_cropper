import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'a526-2401-4900-1ca2-c2e7-f05b-4580-64b9-c1be.ngrok-free.app', // Add your ngrok host here
    ],},
})
