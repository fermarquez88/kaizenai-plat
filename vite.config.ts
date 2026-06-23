import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// For GitHub Pages project sites set DEPLOY_BASE="/kaizenai-plat/".
// For Vercel/Netlify/root leave it as "/".
const base = process.env.DEPLOY_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'KaizenAI — Red centrada en la persona',
        short_name: 'KaizenAI',
        description: 'Salud cerebral comunitaria: antes y después del diagnóstico.',
        lang: 'es',
        theme_color: '#2E7D74',
        background_color: '#F7F3EC',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
