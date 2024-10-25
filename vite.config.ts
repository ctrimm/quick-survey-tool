// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Get deployment environment
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
})
