"use client";

import Link from "next/link";
import Image from "next/image";

function Logo({ src = "/logo-arcnet.svg", brand = "ARCnet" }: { src?: string; brand?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-7 w-7 overflow-hidden rounded-md ring-1 ring-white/10 bg-white/5">
        <Image src={src} alt={`${brand} logo`} fill className="object-contain p-[3px]" priority />
      </div>
      <span className="text-white/90 text-sm font-semibold tracking-tight">{brand}</span>
    </div>
  );
}

export default function Header({
  logoSrc = "/logo-arcnet.svg",
  brand = "ARCnet",
}: {
  logoSrc?: string;
  brand?: string;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="mx-auto flex h-14 w-full max-w-screen-xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" aria-label={`Go to ${brand} home`}>
          <Logo src={logoSrc} brand={brand} />
        </Link>

        {/* Only CTA button */}
        <Link
          href="/activate"
          className="inline-flex h-9 items-center rounded-xl px-3 text-xs font-medium
                     bg-gradient-to-r from-[#a78bfa]/20 to-[#93c5fd]/20
                     ring-1 ring-white/10 hover:bg-white/10"
          aria-label="Activate Account"
        >
          Activate Account
        </Link>
      </div>
    </header>
  );
}
