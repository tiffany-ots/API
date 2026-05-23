import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/API/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/app-chunk.js',
        assetFileNames: 'assets/app.[ext]',
      },
    },
  },
})
