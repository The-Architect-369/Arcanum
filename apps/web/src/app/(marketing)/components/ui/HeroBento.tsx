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
    <BentoCard>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h1 className="hero-title gradient-text">{copy.hero.title}</h1>
        <p className="hero-caption lead">
          {[copy.hero.line1, copy.hero.line2].join(" ")}
        </p>

        <div className="relative z-0 hope-wave my-6">
          <HopeOrb size={136} intensity={1.08} oscillate irisOffsetPx={-6} />
        </div>

        <Link
          href="#activate"
          onClick={scrollToActivate}
          className="cta-orb ring-cyan mt-4"
        >
          Summon Hope
        </Link>

        <p className="hero-tagline mt-6">
          <em>{copy.hero.tagline}</em>
        </p>
      </div>
    </BentoCard>
  );
}
