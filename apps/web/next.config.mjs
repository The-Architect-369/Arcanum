/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  async headers() {
    return [{
      source: "/updates/a14-2/:file",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    }];
  },
};
export default nextConfig;
