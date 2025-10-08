/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Lint note:
  // If you don't want ESLint during build, leave this on.
  eslint: { ignoreDuringBuilds: true },

  // App Router typed routes is fine to keep if you're already using it.
  experimental: { typedRoutes: true },

  // Do NOT set output: 'standalone' here. Default is fine for pnpm start and Vercel.
};

export default nextConfig;