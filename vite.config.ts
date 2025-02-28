import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import { router as uploadRouter } from './src/api/upload';
import type { Connect, ViteDevServer } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'build'
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
