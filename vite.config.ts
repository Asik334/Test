import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Ensure assets (img.png) are always inlined or hashed correctly
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.webp'],
  build: {
    // Inline small assets as base64 to avoid path issues on any deploy host
    assetsInlineLimit: 50_000, // 50KB — img.png is ~30KB so it will be inlined
  },
})
