import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/register': 'http://localhost:5000',
      '/login': 'http://localhost:5000',
      '/notes': 'http://localhost:5000',
      '/add-note': 'http://localhost:5000',
      '/logout': 'http://localhost:5000',
      hmr: false, 
    }
  }
})
