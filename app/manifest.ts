import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AstroVeda — Vedic Astrology',
    short_name: 'AstroVeda',
    description: 'Accurate Vedic astrology, Kundli, Milan, and Panchang.',
    start_url: '/home',
    display: 'standalone',
    background_color: '#0F1F3D',
    theme_color: '#0F1F3D',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['lifestyle', 'utilities'],
  };
}
