import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor code into separate chunks for better caching
          if (id.includes('node_modules/react')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-react-router';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
        }
      }
    },
    // Improved chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Use built-in minification (esbuild) instead of terser to avoid dependency issues
    minify: 'esbuild',
    // Optimize how code is split
    target: 'es2020'
  },
  // Optimize CSS
  css: {
    postcss: './postcss.config.js'
  }
})
