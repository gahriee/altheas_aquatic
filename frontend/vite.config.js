import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { outDir: '../public/dist', emptyOutDir: true },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        credentials: true,
      },
      '/image.php': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
