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
    '%VITE_GITHUB_OWNER%': JSON.stringify(process.env.VITE_GITHUB_OWNER),
    '%VITE_GITHUB_REPO%': JSON.stringify(process.env.VITE_GITHUB_REPO),
    '%VITE_GITHUB_TOKEN%': JSON.stringify(process.env.VITE_GITHUB_TOKEN),
  }
})