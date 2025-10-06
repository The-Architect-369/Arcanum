// Next.js 15 - ESM config
import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

const withPWAWrapped = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: !isProd, // generate SW only in prod (Vercel)
});

export default withPWAWrapped({
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: { remotePatterns: [] },
});