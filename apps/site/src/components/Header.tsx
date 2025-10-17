'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, MouseEvent } from 'react';

/**
 * Header
 * Sticky translucent top navigation bar for the Arcanum landing page.
 * Smoothly scrolls to the Hero section on click, compatible with snap layout.
 */
function Logo({ brand = 'Arcanum' }: { brand?: string }) {
  return (
    <div className="flex items-center gap-2 select-none">
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
      <span className="text-white/90 text-sm font-semibold tracking-tight">
        {brand}
      </span>
    </div>
  );
}

export default function Header({ brand = 'Arcanum' }: { brand?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Handles click on the Arcanum logo or "home" link.
   * - If not on the homepage, navigates to "/#hero".
   * - If already on "/", performs smooth scroll into view.
   */
  const handleHomeClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      const isHome = pathname === '/';
      const hero = document.getElementById('hero');

      if (isHome && hero) {
        // Use smooth scroll when already home
        hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Otherwise, push to root anchor
        router.push('/#hero');
      }
    },
    [pathname, router]
  );

  /**
   * Handles click on "Activate Account"
   * Smoothly scrolls to activate section if on home, otherwise routes to /#activate
   */
  const handleActivateClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      const isHome = pathname === '/';
      const activate = document.getElementById('activate');

      if (isHome && activate) {
        activate.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        router.push('/#activate');
      }
    },
    [pathname, router]
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="mx-auto flex h-14 w-full max-w-screen-xl items-center justify-between px-4">
        {/* Left: Brand / Home Link */}
        <Link
          href="/#hero"
          onClick={handleHomeClick}
          aria-label={`Go to ${brand} home`}
          className="cursor-pointer"
          prefetch={false}
        >
          <Logo brand={brand} />
        </Link>

        {/* Right: CTA */}
        <Link
          href="/#activate"
          onClick={handleActivateClick}
          className="inline-flex h-9 items-center rounded-xl px-3 text-xs font-medium
                     bg-gradient-to-r from-[#a78bfa]/20 to-[#93c5fd]/20
                     ring-1 ring-white/10 hover:bg-white/10 transition-all duration-300"
          aria-label="Start Activation"
          prefetch={false}
        >
          Activate Account
        </Link>
      </div>
    </header>
  );
}
