import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '192.168.0.102',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://192.168.0.102:8080',
        changeOrigin: true,
      },
    },
  },
})




