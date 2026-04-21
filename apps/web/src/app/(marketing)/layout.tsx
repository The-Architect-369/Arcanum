import "../globals.css";
import "./styles/motion.css";
import "./styles/utilities.css";
import ClientLayout from "./client-layout";
import type { Metadata } from "next";

const title = "Arcanum";
const description =
  "Decentralized identity. Cosmic timing. Community-owned network.";
const ogImage = "/favicon.ico";

export const metadata: Metadata = {
  metadataBase: new URL("https://thearcanum.net"),
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased text-white bg-black">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
