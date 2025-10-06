import type { Metadata } from "next";
import Header from "../components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arcanum — Hope Landing",
  description: "Claim your Chain Code, meet Hope, and explore the ARCnet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#03070B] text-white antialiased">
        <div
          aria-hidden
          className="fixed inset-0 -z-20 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(0,120,255,0.12),transparent),radial-gradient(50%_60%_at_120%_20%,rgba(0,255,240,0.08),transparent)]"
        />
        <Header />
        <div className="pt-14">{children}</div>

        <footer className="mx-auto mt-16 w-full max-w-screen-xl px-4 pb-10 text-xs text-white/60">
          <div className="h-px w-full bg-white/10" />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} Arcanum</p>
            <nav className="flex flex-wrap items-center gap-4">
              <a href="/legal" className="hover:text-white">Legal</a>
              <a href="/faq" className="hover:text-white">FAQ</a>
              <a href="/install" className="hover:text-white">Install</a>
              <a href="/sitemap.xml" className="hover:text-white">Sitemap</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
