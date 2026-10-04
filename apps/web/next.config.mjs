/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  async headers() {
    return [{
      source: "/updates/release.json",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    }, {
      source: "/updates/a18/:file",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    }, {
      source: "/updates/a14-2/:file",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    }, {
      source: "/updates/a15-verification/:file",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    }, {
      source: "/updates/a15-recovery/:file",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    }, {
      source: "/updates/a15-recovery-verification/:file",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    }, {
      source: "/updates/a15-settlement/:file",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    }, {
      source: "/updates/a15-settlement-verification/:file",
      headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
    }];
  },
};
export default nextConfig;
