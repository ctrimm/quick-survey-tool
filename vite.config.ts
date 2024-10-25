import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/quick-survey-tool/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'window.ENV': {
      GITHUB_OWNER: process.env.VITE_GITHUB_OWNER,
      GITHUB_REPO: process.env.VITE_GITHUB_REPO,
      GITHUB_TOKEN: process.env.VITE_GITHUB_TOKEN
    }
  }
})