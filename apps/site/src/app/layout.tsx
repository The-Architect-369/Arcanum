import "./globals.css";
import "./motion.css";
import "./utilities.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ConstellationCanvas from "@/components/ConstellationCanvas";
import Script from "next/script";

const title = "Arcanum";
const description = "Decentralized identity. Cosmic timing. Community-owned network.";
const ogImage = "/logo-arcanum.svg";

export const metadata: Metadata = {
  metadataBase: new URL("https://thearcanum.net"),
  title: { default: title, template: `%s — ${title}` },
  description,
  applicationName: "Arcanum",
  manifest: "/site.webmanifest",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    images: [{ url: ogImage, width: 512, height: 512, alt: "Arcanum" }],
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary", title, description, images: [ogImage] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Must be inside <body>, and run before hydration */}
        <Script id="scroll-restoration" strategy="beforeInteractive">{`
          try {
            if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
            // Ensure top-of-page on hard reload when there is no in-page hash
            if (!location.hash) { window.scrollTo(0, 0); }
          } catch {}
        `}</Script>

        <div className="constellation-bg">
          <ConstellationCanvas />
        </div>
        <Header brand="Arcanum" />
        <div className="layer-content">{children}</div>
      </body>
    </html>
  );
}
