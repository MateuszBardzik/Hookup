import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The Django back-end runs on port 8000. During development Vite forwards
// every /api and /media request to it, so the browser only talks to
// http://localhost:5173 and no CORS setup is needed.
const BACKEND_URL = 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.trycloudflare.com'],
    port: 5173,
    proxy: {
      '/api': BACKEND_URL,
      '/media': BACKEND_URL,
    },
  },
})
