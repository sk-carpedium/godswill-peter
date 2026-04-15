/**
 * vite.config.js — Nexus Social frontend build config
 *
 * Key settings:
 *   @/ alias → frontend-src root (components/, hooks/, src/, etc.)
 *   API proxy → dev server proxies /api to backend (optional)
 *   Build output → dist/
 *
 * Place at: vite.config.js (project root)
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  resolve: {
    alias: [
      // @/lib/* → src/lib/* (shared lib copied from frontend-lib)
      { find: /^@\/lib\//, replacement: `${path.resolve(__dirname, 'src/lib')}/` },
      { find: '@', replacement: path.resolve(__dirname, '.') },
    ],
  },

  server: {
    port: 5173,
    // Optional: proxy API calls so CORS isn't needed during dev
    // Remove if you're using VITE_API_URL directly
    proxy: {
      '/v1': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          query:   ['@tanstack/react-query'],
          charts:  ['recharts'],
          ui:      ['lucide-react'],
        },
      },
    },
  },

  define: {
    // Expose build time
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
}));
