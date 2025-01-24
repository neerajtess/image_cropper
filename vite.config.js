import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'ef6b-2401-4900-1ca2-8a48-1952-d3a0-f115-e5b9.ngrok-free.app', // Add your ngrok host here
    ],
  
    host:true,
  
  },
})
