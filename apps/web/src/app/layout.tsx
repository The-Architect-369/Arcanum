import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arcanum DApp",
  description: "Arcanum DApp (marketing + onboarding + app in one)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
