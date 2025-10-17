'use client';

import ActiveSectionObserver from '@/components/ActiveSectionObserver';
import HeroBento from '@/components/ui/HeroBento';
import BentoShowcase from '@/components/ui/BentoShowcase';
import ActivateBento from '@/components/ui/ActivateBento';

export default function HomePage() {
  return (
    <main className="snap-container layer-content" id="top">
      <ActiveSectionObserver />

      {/* HERO — explicit anchor + MUST-STOP snap */}
      <section id="hero" className="snap-section snap-first" aria-label="Hero">
        <HeroBento />
      </section>

      {/* SHOWCASES */}
      <section className="snap-section" aria-label="ARCnet">
        <BentoShowcase variant="arcnet" />
      </section>

      <section className="snap-section" aria-label="MANA">
        <BentoShowcase variant="mana" />
      </section>

      <section className="snap-section" aria-label="Tempest">
        <BentoShowcase variant="tempus" />
      </section>

      {/* ACTIVATE — keep a little give before the footer */}
      <section
        className="snap-section snap-last"
        id="activate"
        aria-label="Activate"
      >
        <ActivateBento />
      </section>

      {/* LEGAL FOOTER */}
      <footer className="snap-end max-prose text-center mx-auto py-10 opacity-80">
        <p>© {new Date().getFullYear()} Arcanum. All rights reserved.</p>
        <p className="mt-2">
          <a
            href="/privacy"
            className="underline decoration-transparent hover:decoration-current"
          >
            Privacy
          </a>
          {' · '}
          <a
            href="/terms"
            className="underline decoration-transparent hover:decoration-current"
          >
            Terms
          </a>
        </p>
      </footer>
    </main>
  );
}
