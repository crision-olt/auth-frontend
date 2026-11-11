import { lingui } from '@lingui/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), lingui({ macroTransform: true }), tailwindcss()],
  define: {
    'import.meta.env.AUTH_SERVICE_URL': JSON.stringify(loadEnv(mode, process.cwd(), '').AUTH_SERVICE_URL ?? ''),
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
}))
