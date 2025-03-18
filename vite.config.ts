import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/ui.tsx'), // Corrected entry point
      name: 'ui',
      fileName: 'bundle',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.js',
        extend: true,
        dir: 'dist',
        // Removed sourcemap here, as it's already set in build.sourcemap
      },
    },
  },
});