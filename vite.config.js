import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'f733-2401-4900-1ca3-f9ec-8591-6629-efff-acf3.ngrok-free.app', // Add your ngrok host here
    ],
  
    host:true,
  
  },
})
