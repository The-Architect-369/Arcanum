"use client";

import Link from "next/link";
import BentoCard from "@/components/ui/BentoCard";
import { HopePresenceAvatar } from "@/components/hope/HopePresenceAvatar";
import type { HopeVisualState } from "@/lib/hope/visual";
import { copy } from "@/content/narrative";

const HERO_VISUAL_STATE: HopeVisualState = {
  avatar: {
    form: "orb",
    openness: 0.72,
    gazeSoftness: 0.78,
    silhouetteScale: 1,
  },
  aura: {
    intensity: 0.72,
    radius: 164,
    bloom: 0.42,
    pulseRate: "slow",
    ringCount: 2,
  },
  motion: {
    profile: "calm",
    drift: "low",
    breathMs: 5200,
    shimmer: "soft",
    transitionMs: 480,
  },
  palette: {
    field: "rgba(56, 189, 248, 0.22)",
    core: "rgba(251, 191, 36, 0.34)",
    aura: "rgba(125, 211, 252, 0.34)",
    contrast: "medium",
  },
  environment: {
    backgroundField: "breathing",
    particleDensity: "low",
    focusVignette: "soft",
  },
};

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

        <div className="relative z-0 hope-wave my-6 grid place-items-center" aria-hidden>
          <HopePresenceAvatar visualState={HERO_VISUAL_STATE} size={136} />
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
