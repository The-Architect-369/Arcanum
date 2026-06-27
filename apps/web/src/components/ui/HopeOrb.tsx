"use client";

import { HopePresenceAvatar } from "@/components/hope/HopePresenceAvatar";
import type { HopeVisualState } from "@/lib/hope/visual";

type HopeOrbProps = {
  size?: number;
  label?: string;
  intensity?: number;
  oscillate?: boolean;
  irisOffsetPx?: number;
  irisOffsetPct?: number;
};

function buildVisualState(intensity: number): HopeVisualState {
  const clamped = Math.max(0.4, Math.min(1.4, intensity));
  return {
    avatar: {
      form: "orb",
      openness: 0.6,
      gazeSoftness: 0.78,
      silhouetteScale: 0.96 + clamped * 0.04,
    },
    aura: {
      intensity: Math.min(1, 0.42 + clamped * 0.22),
      radius: Math.round(120 + clamped * 26),
      bloom: Math.min(0.62, 0.22 + clamped * 0.18),
      pulseRate: "slow",
      ringCount: clamped >= 1.1 ? 2 : 1,
    },
    motion: {
      profile: "calm",
      drift: "low",
      breathMs: 5400,
      shimmer: "soft",
      transitionMs: 480,
    },
    palette: {
      field: "rgba(56, 189, 248, 0.2)",
      core: "rgba(251, 191, 36, 0.3)",
      aura: "rgba(125, 211, 252, 0.32)",
      contrast: "medium",
    },
    environment: {
      backgroundField: "breathing",
      particleDensity: "low",
      focusVignette: "soft",
    },
  };
}

/**
 * Deprecated compatibility wrapper.
 * New work should use HopePresenceAvatar or HopePresenceScene directly.
 */
export default function HopeOrb({ size = 160, label, intensity = 1.08 }: HopeOrbProps) {
  const visualState = buildVisualState(intensity);

  return (
    <div className="flex flex-col items-center">
      <HopePresenceAvatar visualState={visualState} size={Math.max(84, size)} />
      {label ? <div className="mt-2 text-xs md:text-sm opacity-80">{label}</div> : null}
    </div>
  );
}
