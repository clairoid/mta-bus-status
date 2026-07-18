import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pre-bundle the heavy deps up front so adding an import later doesn't
  // trigger a mid-session re-optimize (which can desync the React singleton).
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'mapbox-gl'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3005',
    },
  },
})
