import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/users': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/workouts': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/exercises': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/nutrition': {
        target: 'http://localhost:3004',
        changeOrigin: true,
      },
    },
  },
})
