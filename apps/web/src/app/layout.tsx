import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./app-polish.css";
import PWARegister from "@/components/PWARegister";
import DeviceRuntime from "@/components/DeviceRuntime";

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
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-navbutton-color": "#000000",
    "msapplication-TileColor": "#000000",
    "theme-color": "rgba(0,0,0,0)",
  },
};

export const viewport: Viewport = {
  themeColor: "rgba(0,0,0,0)",
  colorScheme: "dark",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PWARegister />
        <DeviceRuntime />
        {children}
      </body>
    </html>
  );
}
