import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/postcss';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    {
      name: 'inline-css-and-copy',
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
            const outputDir = options.dir || 'public/dist';
            const distPath = path.join(outputDir, jsFile);
            
            fs.writeFileSync(distPath, inlinedJs);
            
            console.log(`CSS inlined into widget.js and saved to ${outputDir}`);
            
            // Remove the separate CSS file
            fs.unlinkSync(path.join(outputDir, cssFile));
          }
        }
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
    outDir: resolve(__dirname, 'public/dist'),
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