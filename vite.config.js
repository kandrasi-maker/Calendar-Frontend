import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- FIX: Add build target ---
  // This tells Vite's builder (esbuild) to allow modern features
  // like 'import.meta' which are not in 'es2015'.
  build: {
    target: 'esnext' // Use a modern target for production builds
  },
  esbuild: {
    target: 'esnext' // Also ensure esbuild uses the modern target in dev
  }
  // --- End Fix ---
})
