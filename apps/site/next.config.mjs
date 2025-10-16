/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    typedRoutes: true,
    externalDir: true
  },
  transpilePackages: ['@shared']
}

export default nextConfig