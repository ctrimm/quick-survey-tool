// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'quick-survey-tool';

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? `/${repoName}/` : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  define: {
    '%VITE_GITHUB_OWNER%': JSON.stringify(process.env.VITE_GITHUB_OWNER),
    '%VITE_GITHUB_REPO%': JSON.stringify(process.env.VITE_GITHUB_REPO),
    '%VITE_GITHUB_TOKEN%': JSON.stringify(process.env.VITE_GITHUB_TOKEN),
  },
})
