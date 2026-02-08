'use client';

import ActiveSectionObserver from '@/components/ActiveSectionObserver';
import HeroBento from '@/components/ui/HeroBento';
import BentoShowcase from '@/components/ui/BentoShowcase';
import ActivateBento from '@/components/ui/ActivateBento';
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="snap-container layer-content" id="top">
      <ActiveSectionObserver />

      {/* HERO — explicit anchor + MUST-STOP snap */}
      <section id="hero" className="snap-section snap-first" aria-labelledby="hero-heading">
        <HeroBento />
      </section>

      {/* SHOWCASES */}
      <section className="snap-section" aria-labelledby="arcnet-heading">
        <BentoShowcase variant="arcnet" />
      </section>

      <section className="snap-section" aria-labelledby="mana-heading">
        <BentoShowcase variant="mana" />
      </section>

      <section className="snap-section" aria-labelledby="tempus-heading">
        <BentoShowcase variant="tempus" />
      </section>

      {/* ACTIVATE */}
      <section id="activate" className="snap-section snap-last" aria-labelledby="activate-heading">
        <ActivateBento />
      </section>

      {/* FOOTER */}
      <footer className="snap-end max-w-prose text-center mx-auto py-10 opacity-80">
        <p>© {new Date().getFullYear()} Arcanum. All rights reserved.</p>
        <p className="mt-2">
          <a href="/privacy" className="underline decoration-transparent hover:decoration-current">
            Privacy
          </a>
          <Link
            href="/hope/presence?entry=marketing"
            className="text-sm opacity-60 hover:opacity-100 transition"
          >
            Enter presence
          </Link>
          {' · '}
          <a href="/terms" className="underline decoration-transparent hover:decoration-current">
            Terms
          </a>
        </p>
      </footer>
    </main>
  );
}
