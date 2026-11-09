import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  applicationName: "Arcanum Updates",
  manifest: "/updates/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Updates", statusBarStyle: "default" },
};
export const viewport: Viewport = {
  themeColor: "#0b1528",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};
export default function UpdatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
