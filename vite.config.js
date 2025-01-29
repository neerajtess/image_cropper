import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '2f61-2401-4900-1ca3-e0-44f4-a22b-fc11-862.ngrok-free.app', // Add your ngrok host here
    ],
  
    host:true,
  
  },
})
