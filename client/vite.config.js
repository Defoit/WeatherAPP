import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Прокси для нашего бэкенда (погода)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Блок /map-tiles мы можем удалить, так как используем CARTO напрямую с ключом
    },
  },
})