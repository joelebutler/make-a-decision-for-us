import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
console.log('VITE_BACKEND_PORT:', Bun.env.VITE_BACKEND_PORT);
export default defineConfig({
  resolve: {
    alias: {
      '@front': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '^/api(/|$)': {
        target: `http://localhost:${Bun.env.VITE_BACKEND_PORT}`,
        changeOrigin: true
      },
    }
  }
})
