import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/API/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/app.[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
