/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: "architect\\.the-arcanum\\.net" }],
          destination: "/architect",
        },
        {
          source: "/",
          has: [{ type: "host", value: "updates\\.the-arcanum\\.net" }],
          destination: "/updates",
        },
        {
          source: "/",
          has: [{ type: "host", value: "journeys\\.the-arcanum\\.net" }],
          destination: "/journeys",
        },
        // Preserve the reviewed standalone renderer without reinterpreting it in React.
        { source: "/", destination: "/experience/v07/index.html" },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/updates-sw.js",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/architect/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/api/auth/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
      {
        source: "/updates/release.json",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/updates/a18/:file",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/updates/a14-2/:file",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/updates/a15-verification/:file",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/updates/a15-recovery/:file",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/updates/a15-recovery-verification/:file",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/updates/a15-settlement/:file",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/updates/a15-settlement-verification/:file",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};
export default nextConfig;
