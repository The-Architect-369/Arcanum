import "../globals.css";
import "./styles/motion.css";
import "./styles/utilities.css";
import type { Metadata, Viewport } from "next";

const title = "Arcanum";
const description =
  "Discover Arcanum: reflection with HOPE, rhythm with TEMPUS, learning with Vitae, and the developing ARCnet network and MANA economy.";
const ogImage = "/favicon.ico";

export const metadata: Metadata = {
  metadataBase: new URL("https://the-arcanum.net"),
  title: { default: title, template: `%s • ${title}` },
  description,
  applicationName: "Arcanum",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    images: [{ url: ogImage, alt: "Arcanum" }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [ogImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
