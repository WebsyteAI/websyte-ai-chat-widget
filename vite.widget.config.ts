import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { exec } from 'child_process';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-widget',
      writeBundle() {
        exec('cp dist/widget.js public/widget.js', (error) => {
          if (error) {
            console.error('Failed to copy widget.js:', error);
          } else {
            console.log('Widget copied to public/widget.js');
          }
        });
      }
    }
  ],
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
    watch: {}
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});