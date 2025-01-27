import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'd5b9-2401-4900-1c09-4b54-2006-1ac-6371-a8aa.ngrok-free.app', // Add your ngrok host here
    ],
  
    host:true,
  
  },
})
