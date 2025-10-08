import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ConstellationCanvas from "@/components/ConstellationCanvas";

const title = "ARCnet";
const description = "Decentralized identity. Cosmic timing. Community-owned network.";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcanum.io"),
  title: { default: title, template: `%s — ${title}` },
  description,
  applicationName: "ARCnet",
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg"
    // Note: add /apple-touch-icon.png later; omitted to avoid 404
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    images: [{ url: "/logo-arcnet.svg", width: 512, height: 512, alt: "ARCnet" }],
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/logo-arcnet.svg"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* background constellation layer */}
        <div className="constellation-bg">
          <ConstellationCanvas />
        </div>

        {/* header + content layer */}
        <Header brand="ARCnet" />
        <div className="layer-content">{children}</div>
      </body>
    </html>
  );
}
