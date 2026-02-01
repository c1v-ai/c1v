import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Product Helper',
    short_name: 'PrdHelper',
    description: 'AI-Powered PRD Generation - Create engineering-quality Product Requirements Documents in minutes',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0A5C4E',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
