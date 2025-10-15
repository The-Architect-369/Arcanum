"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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

export default function Header({ brand = "Arcanum" }: { brand?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleHomeClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // Always route to the explicit Hero anchor.
      e.preventDefault();
      if (pathname !== "/") {
        router.push("/#hero");
        return;
      }
      // Already on home: scroll the hero into view (smooth)
      const hero = document.getElementById("hero");
      if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
      else router.push("/#hero");
    },
    [pathname, router]
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="mx-auto flex h-14 w-full max-w-screen-xl items-center justify-between px-4">
        <Link
          href="/#hero"
          onClick={handleHomeClick}
          aria-label={`Go to ${brand} home`}
          className="cursor-pointer"
          prefetch={false}
        >
          <Logo brand={brand} />
        </Link>

        <Link
          href="/activate"
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
