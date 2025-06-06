import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { exec } from 'child_process';
import tailwindcss from '@tailwindcss/postcss';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inline-css',
      writeBundle(options, bundle) {
        const cssFile = Object.keys(bundle).find(file => file.endsWith('.css'));
        const jsFile = Object.keys(bundle).find(file => file.endsWith('.js'));
        
        if (cssFile && jsFile) {
          const cssAsset = bundle[cssFile];
          const jsChunk = bundle[jsFile];
          
          if (cssAsset && 'source' in cssAsset && jsChunk && 'code' in jsChunk) {
            const cssContent = cssAsset.source;
            const jsContent = jsChunk.code;
            
            // Inject CSS at the beginning of the JS file
            const inlinedJs = `
// Inject CSS styles into Shadow DOM
window.WebsyteChatCSS = ${JSON.stringify(cssContent)};

${jsContent}`;
            
            // Write the modified JS file
            fs.writeFileSync(path.join(options.dir || 'dist', jsFile), inlinedJs);
            
            // Remove the separate CSS file
            fs.unlinkSync(path.join(options.dir || 'dist', cssFile));
            
            console.log('CSS inlined into widget.js for Shadow DOM');
          }
        }
      }
    },
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
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
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
        assetFileNames: (assetInfo) => {
          if (assetInfo.names && assetInfo.names[0]?.endsWith('.css')) {
            return 'widget.css';
          }
          return assetInfo.names?.[0] || 'asset';
        },
      },
    },
    cssCodeSplit: false,
    minify: 'esbuild'
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});