import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
// Stable entry paths keep cached HTML usable after a Pages deployment removes
// the previous artifact. The app is a single bundle (no stale chunk imports).
export default defineConfig({plugins:[react(),{name:'entry-cache-version',enforce:'post',generateBundle(_options,bundle){const html=bundle['index.html'];const entry=bundle['assets/team-architect.js'];if(html?.type==='asset'&&entry?.type==='chunk'){const version=createHash('sha256').update(entry.code).update(String(bundle['assets/team-architect.css']?.type==='asset'?bundle['assets/team-architect.css'].source:'')).digest('hex').slice(0,12);html.source=String(html.source).replace(/assets\/team-architect\.(js|css)/g,`assets/team-architect.$1?v=${version}`);}}}],base:'./',build:{outDir:'dist',sourcemap:false,rollupOptions:{output:{entryFileNames:'assets/team-architect.js',assetFileNames:asset=>asset.names.some(name=>name.endsWith('.css'))?'assets/team-architect.css':'assets/[name]-[hash][extname]'}}}});
