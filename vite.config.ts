import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Stable entry paths keep cached HTML usable after a Pages deployment removes
// the previous artifact. The app is a single bundle (no stale chunk imports).
export default defineConfig({plugins:[react()],base:'./',build:{outDir:'dist',sourcemap:false,rollupOptions:{output:{entryFileNames:'assets/team-architect.js',assetFileNames:asset=>asset.names.some(name=>name.endsWith('.css'))?'assets/team-architect.css':'assets/[name]-[hash][extname]'}}}});
