import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'app/widget-entry.tsx'),
      name: 'WebsyteChat',
      fileName: () => 'widget.js',
      formats: ['iife']
    },
    outDir: 'dist',
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
    cssCodeSplit: false,
    minify: 'esbuild',
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});