import { NextResponse } from "next/server";
export function GET() {
  const preview = process.env.VERCEL_ENV !== "production";
  return NextResponse.json(
    {
      id: "/updates",
      name: preview ? "Arcanum Updates Preview" : "Arcanum Updates",
      short_name: preview ? "Updates Preview" : "Updates",
      description:
        "Follow Arcanum development, available releases and anticipated work.",
      start_url: "/updates?source=pwa",
      scope: "/updates",
      display: "standalone",
      background_color: "#0b1528",
      theme_color: "#0b1528",
      lang: "en",
      icons: [
        {
          src: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "no-store",
      },
    },
  );
}
