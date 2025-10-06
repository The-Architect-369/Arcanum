import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010";
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/downloads`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/chain-code`, lastModified: now, changeFrequency: "weekly", priority: 0.9 }
  ];
}
