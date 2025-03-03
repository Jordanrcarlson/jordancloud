import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '^/images/.*': {  // More specific pattern
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  publicDir: false  // Disable Vite's static file handling
});
