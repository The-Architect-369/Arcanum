import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./app-polish.css";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "Arcanum",
  description: "Decentralized identity. Cosmic timing. Community-owned network.",
  applicationName: "Arcanum",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arcanum",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-navbutton-color": "#000000",
    "msapplication-TileColor": "#000000",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "dark",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="rgba(0,0,0,0)" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="rgba(0,0,0,0)" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="rgba(0,0,0,0)" />
      </head>
      <body className="antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
