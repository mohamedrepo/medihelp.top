import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Two build targets share this config:
 *   1. the client bundle (`vite build`) — output in `dist/`
 *   2. the prerender bundle (`vite build --ssr src/entry-server.tsx`) — `dist-server/`
 *
 * `scripts/prerender.mjs` then renders every route to a real static HTML file.
 */
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: isSsrBuild ? 'dist-server' : 'dist',
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // The prerender script imports the server bundle by path, so its entry
        // filename must be stable and unhashed. Client assets are content-hashed
        // as normal so they can be cached indefinitely.
        entryFileNames: isSsrBuild ? 'entry-server.js' : 'assets/[name]-[hash].js',
        ...(isSsrBuild
          ? {}
          : {
              chunkFileNames: 'assets/[name]-[hash].js',
              assetFileNames: 'assets/[name]-[hash][extname]',
            }),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // During `vite dev` the contact endpoint is served by the Worker's own
      // `wrangler dev` instance, mirroring how it behaves in production.
      //
      // `changeOrigin` MUST stay false. Turning it on rewrites the Host header to
      // the proxy target, and the Worker compares the request host against the
      // `Origin` header to reject cross-site posts — so every submission made from
      // the dev server would be answered with 403. Preserving the Host keeps that
      // check consistent with production, where host and origin really do match.
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: false,
      },
    },
  },
}));
