import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Sekolah_MA/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
