import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  server: {
    port: 5173,
    // Proxy para evitar CORS durante desarrollo local
    // El backend PHP corre en localhost (XAMPP/Laragon/etc.)
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    // Separar vendor chunks para mejor caching en Vercel
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          ui:      ['react-hot-toast', 'qrcode.react'],
          http:    ['axios'],
        },
      },
    },
  },

  // Variables de entorno — prefijo VITE_ las expone al cliente
  // Definir en .env.local para desarrollo:
  //   VITE_API_URL=http://localhost:8000
  // Y en Vercel para producción:
  //   VITE_API_URL=https://tu-backend.infinityfreeapp.com
})
