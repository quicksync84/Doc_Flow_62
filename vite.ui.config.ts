import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/features/menu/MenuUI.html'),
      output: {
        entryFileNames: 'ui.html'
      }
    }
  }
});