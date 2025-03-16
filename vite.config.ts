import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '.',
    lib: {
      entry: resolve(__dirname, 'ui/src/main.tsx'),
      name: 'ui',
      fileName: 'bundle',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.js',
        extend: true
      }
    }
  }
});