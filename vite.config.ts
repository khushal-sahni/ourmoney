import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32.png'],
      manifest: {
        name: 'ourmoney',
        short_name: 'ourmoney',
        description: 'Independent prototype for tracing synthetic public-scheme fund flows.',
        theme_color: '#0f1214',
        background_color: '#0f1214',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon-32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
});
