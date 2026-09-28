import "../globals.css";
import "./styles/motion.css";
import "./styles/utilities.css";
import type { Metadata } from "next";

const title = "Arcanum";
const description =
  "Explore Arcanum's public work and follow verified Android releases when available.";
const ogImage = "/favicon.ico";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcanum-umber.vercel.app"),
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

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
