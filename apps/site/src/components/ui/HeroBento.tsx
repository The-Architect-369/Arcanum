"use client";

import Link from "next/link";
import HopeOrb from "@/components/ui/HopeOrb";
import BentoCard from "@/components/ui/BentoCard";
import { copy } from "@/content/narrative";

export default function HeroBento() {
  function scrollToActivate(e: React.MouseEvent) {
    e.preventDefault();
    const target = document.getElementById("activate");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <BentoCard className="bento-width bento-hero bento-hero-inset grid place-items-center text-center">
      <h1 className="hero-title gradient-text">{copy.hero.title}</h1>
      <p className="hero-caption lead">{[copy.hero.line1, copy.hero.line2].join(" ")}</p>

      <div className="relative z-0 hope-wave mt-5 md:mt-6 mb-4 md:mb-5">
        <HopeOrb size={156} intensity={1.08} oscillate irisOffsetPx={-6} />
      </div>

      <Link href="#activate" onClick={scrollToActivate} className="relative z-20 cta-orb ring-cyan">
        Summon Hope
      </Link>

      <p className="hero-tagline">
        <em>{copy.hero.tagline}</em>
      </p>
    </BentoCard>
  );
}
