"use client";
import { useState } from "react";

type HopeOrbProps = {
  size?: number;
  label?: string;
  intensity?: number;
  oscillate?: boolean;
  /** Exact pixel offset for the iris (negative lifts it up). Overrides the pct if set. */
  irisOffsetPx?: number;
  /** % of total size used to offset the iris; negative lifts it up. Default tuned from your test. */
  irisOffsetPct?: number; // e.g., -0.82 means lift by 82% of `size`
};

export default function HopeOrb({
  size = 160,
  label,
  intensity = 1.18,
  oscillate = true,
  irisOffsetPx,
  irisOffsetPct = -0.82, // <- from your -155px @ size=190 observation
}: HopeOrbProps) {
  const [burst, setBurst] = useState(false);

  const s = Math.max(84, size);
  const cornea = Math.round(s * 0.82);
  const iris   = Math.round(s * 0.64);
  const pupil  = Math.round(s * 0.30);
  const seed   = Math.round(s * 0.16);

  // compute the final offset (px). Px wins if provided; otherwise % of size
  const irisOffset = typeof irisOffsetPx === "number" ? irisOffsetPx : Math.round(s * irisOffsetPct);

  return (
    <div className="flex flex-col items-center">
      {/* Visual-only wrapper for hover/click waves */}
      <div
        className={["hope-wrap", burst ? "pulse-burst" : ""].join(" ")}
        style={{ width: s, height: s }}
        onMouseDown={() => { setBurst(true); setTimeout(() => setBurst(false), 720); }}
        aria-hidden
      >
        {/* Orb core */}
        <div
          className={["relative isolate rounded-full", oscillate ? "hope-osc" : ""].join(" ")}
          style={{ width: s, height: s }}
        >
          {/* 1) Aura */}
          <div
            className="hope-aura hope-layer"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "9999px",
              filter: `
                drop-shadow(0 0 ${Math.round(24 * intensity)}px rgba(147,197,253,.32))
                drop-shadow(0 0 ${Math.round(36 * intensity)}px rgba(167,139,250,.24))
              `,
            }}
          />

          {/* 2) Cornea */}
          <div
            className="absolute rounded-full overflow-hidden hope-cornea hope-layer"
            style={{
              width: cornea,
              height: cornea,
              left: (s - cornea) / 2,
              top: (s - cornea) / 2,
            }}
          >
            <div className="hope-cornea-sheen hope-layer" />
          </div>

          {/* 3) Iris — centered, then offset using 'top' (not transform) */}
          <div
            className="absolute rounded-full overflow-hidden hope-iris hope-layer"
            style={{
              width: iris,
              height: iris,
              left: (s - iris) / 2,
              top: (s - iris) / 2 + irisOffset, // <— apply offset here
              boxShadow: `inset 0 0 ${Math.round(18 * intensity)}px rgba(255,255,255,.18)`,
            }}
          >
            <div className="hope-iris-ring hope-layer" />
            <div className="hope-iris-spokes hope-layer" />
          </div>

          {/* 4) Core */}
          <div
            className="absolute rounded-full overflow-hidden hope-core hope-layer"
            style={{
              width: pupil,
              height: pupil,
              left: (s - pupil) / 2,
              top: (s - pupil) / 2,
              boxShadow: `inset 0 0 ${Math.round(20 * intensity)}px rgba(255,255,255,.25)`,
            }}
          >
            <div className="hope-core-breath hope-layer" />
          </div>

          {/* 5) Specular highlight */}
          <div
            className="hope-seed hope-layer"
            style={{
              width: seed,
              height: seed,
              left: (s - seed) / 2 + Math.round(s * -0.04),
              top:  (s - seed) / 2 + Math.round(s * -0.08),
              filter: `drop-shadow(0 0 ${Math.round(10 * intensity)}px rgba(220,245,255,.7))`,
            }}
          />
        </div>

        {/* New: faint concentric wave layer */}
        <div className="hope-wave" />
      </div>

      {label && <div className="mt-2 text-xs md:text-sm opacity-80">{label}</div>}
    </div>
  );
}
