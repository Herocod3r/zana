import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Wails serves the built assets from frontend/dist at runtime (embedded in
// the Go binary) and from Vite's dev server during `wails dev`.
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
