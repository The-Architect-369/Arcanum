import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arcanum — ARCnet',
  description: 'ARCnet client',
  manifest: '/manifest.json',
  themeColor: '#6B4CFF',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/icons/icon-192.png' }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#0B0E1A] text-white">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
