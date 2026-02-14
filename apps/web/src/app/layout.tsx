import "./globals.css";

export const metadata = {
  title: "Arcanum",
  description: "Sovereign Node Runtime",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
