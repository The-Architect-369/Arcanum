/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  compress: true,
  experimental: {
    typedRoutes: true,
    externalDir: true,
  },
  transpilePackages: ["@shared"],
  i18n: {
    locales: ["en", "es", "fr", "de"],
    defaultLocale: "en",
  },
};

export default nextConfig;
