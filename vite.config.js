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
        manualChunks: {
          // Split vendor code into separate chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react'],
        }
      }
    },
    // Improved chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Use built-in minification (esbuild) instead of terser to avoid dependency issues
    minify: 'esbuild'
  },
  // Optimize CSS
  css: {
    postcss: './postcss.config.js'
  }
})
