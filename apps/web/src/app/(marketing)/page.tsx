'use client';

import ActiveSectionObserver from '@/components/ui/ActiveSectionObserver';
import HeroBento from '@/components/ui/HeroBento';
import BentoShowcase from '@/components/ui/BentoShowcase';
import ActivateBento from '@/components/ui/ActivateBento';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-3 sm:p-4" id="top">
      <ActiveSectionObserver />

      <section id="hero" aria-labelledby="hero-heading">
        <HeroBento />
      </section>

      <section aria-labelledby="arcnet-heading">
        <BentoShowcase
          variant="arcnet"
          className="min-h-[420px] sm:min-h-[520px] md:min-h-[620px]"
        />
      </section>

      <section aria-labelledby="mana-heading">
        <BentoShowcase
          variant="mana"
          className="min-h-[420px] sm:min-h-[520px] md:min-h-[620px]"
        />
      </section>

      <section aria-labelledby="tempus-heading">
        <BentoShowcase
          variant="tempus"
          className="min-h-[420px] sm:min-h-[520px] md:min-h-[620px]"
        />
      </section>

      <section id="activate" aria-labelledby="activate-heading">
        <ActivateBento variant="full" />
      </section>
    </main>
  );
}
