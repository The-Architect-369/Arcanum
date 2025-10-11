"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, MouseEvent } from "react";

function Logo({ brand = "Arcanum" }: { brand?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-7 w-7 overflow-hidden rounded-md ring-1 ring-white/10 bg-white/5">
        <Image
          src="/logo-arcanum.svg"
          alt={`${brand} logo`}
          fill
          priority
          sizes="28px"
          className="p-1 object-contain"
        />
      </div>
      <span className="text-white/90 text-sm font-semibold tracking-tight">{brand}</span>
    </div>
  );
}

// Scroll the real container (snap container / layer-content / main) back to top
function scrollHomeTop() {
  const candidates = [
    document.querySelector<HTMLElement>(".snap-container"),
    document.querySelector<HTMLElement>(".layer-content"),
    document.querySelector<HTMLElement>("main"),
  ];

  for (const el of candidates) {
    if (el && el.scrollHeight > el.clientHeight) {
      el.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
  }
  // Fallback to window if the page is the scroller
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Header({ brand = "Arcanum" }: { brand?: string }) {
  const pathname = usePathname();

  const handleHomeClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();            // stay on the page
      // optional: keep URL clean but set a hash target if you use one
      if (location.hash !== "#top") history.replaceState(null, "", "#top");
      scrollHomeTop();               // smooth-scroll the correct container
    }
    // else: let Link navigate to "/" normally (lands at top)
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="mx-auto flex h-14 w-full max-w-screen-xl items-center justify-between px-4">
        {/* Logo → home (and scroll to top if already home) */}
        <Link href="/" onClick={handleHomeClick} aria-label={`Go to ${brand} home`} className="cursor-pointer">
          <Logo brand={brand} />
        </Link>

        {/* Keep CTA exactly as-is */}
        <Link
          href="/activate/start"
          className="inline-flex h-9 items-center rounded-xl px-3 text-xs font-medium
                     bg-gradient-to-r from-[#a78bfa]/20 to-[#93c5fd]/20
                     ring-1 ring-white/10 hover:bg-white/10"
          aria-label="Start Activation"
        >
          Activate Account
        </Link>
      </div>
    </header>
  );
}
