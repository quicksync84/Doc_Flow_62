import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/code.ts'),
      formats: ['iife'],
      name: 'code'
    },
    rollupOptions: {
      external: ['fast-levenshtein'],
      output: {
        globals: {
          'fast-levenshtein': 'fastLevenshtein'
        },
        entryFileNames: 'code.js'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});