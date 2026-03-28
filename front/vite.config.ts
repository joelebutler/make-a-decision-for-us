import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '^/api(/|$)': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
    }
  }
})
