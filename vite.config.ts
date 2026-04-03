import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'wp-theme/assets',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'css/[name][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/openf1': {
        target: 'https://api.openf1.org',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/openf1/, '/v1'),
      },
    },
  },
})
