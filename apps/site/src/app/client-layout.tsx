"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import ConstellationCanvas from "@/components/ConstellationCanvas";

/**
 * ClientLayout
 * Full-page layout for Arcanum landing experience.
 * - Keeps constellation fixed across all scroll sections.
 * - Stabilizes hydration and scroll behavior.
 * - Provides clean separation between fixed background and scrollable content.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Disable browser scroll restoration pre-paint
  if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "instant" })
    );
  }

  useEffect(() => {
    // Scroll reset safeguard on route change
    const timeout = setTimeout(() => {
      const scroller = document.querySelector(".arcanum-scroll-root");
      if (scroller) scroller.scrollTo({ top: 0, behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    }, 80);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {/* 🌌 Fixed global constellation background */}
      <ConstellationCanvas className="constellation-bg pointer-events-none" />

      {/* 🜂 Scrollable content container */}
      <div
        className="arcanum-scroll-root relative h-screen w-screen overflow-y-scroll snap-y snap-mandatory text-white"
        id="scroll-root"
      >
        <Header brand="Arcanum" />
        <main id="content" className="relative z-10 bg-transparent">
          {children}
        </main>
      </div>
    </>
  );
}
