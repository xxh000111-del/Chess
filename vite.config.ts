import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Chess/',
  build: {
    outDir: 'docs'
  },
  
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})