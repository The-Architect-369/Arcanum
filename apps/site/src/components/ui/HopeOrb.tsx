"use client";

type HopeOrbProps = {
  size?: number;
  label?: string;
  /** Base glow strength (0.6–1.6). */
  intensity?: number;
  /** Keep a very subtle vertical float. */
  oscillate?: boolean;
};

export default function HopeOrb({
  size = 160,
  label,
  intensity = 1.18,
  oscillate = true,
}: HopeOrbProps) {
  const s = Math.max(84, size);

  // Proportions tuned for an "eye" read
  const cornea = Math.round(s * 0.82); // outer glossy dome
  const iris   = Math.round(s * 0.64); // colored ring
  const pupil  = Math.round(s * 0.30); // luminous core
  const seed   = Math.round(s * 0.16); // specular highlight

  return (
    <div className="flex flex-col items-center">
      <div
        className={["relative isolate rounded-full", oscillate ? "hope-osc" : ""].join(" ")}
        style={{ width: s, height: s }}
        aria-hidden
      >
        {/* --- 1) Radiant AURA (CENTERED) --- */}
        <div
          className="hope-aura hope-layer"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "9999px",
            // NOTE: no translate/offset here; alignment stays perfect
            filter: `
              drop-shadow(0 0 ${Math.round(24 * intensity)}px rgba(147,197,253,.32))
              drop-shadow(0 0 ${Math.round(36 * intensity)}px rgba(167,139,250,.24))
            `,
          }}
        />

        {/* --- 2) CORNEA (outer glossy dome) --- */}
        <div
          className="absolute rounded-full overflow-hidden hope-cornea hope-layer"
          style={{
            width: cornea,
            height: cornea,
            left: (s - cornea) / 2,
            top: (s - cornea) / 2,
          }}
        >
          {/* moving sheen */}
          <div className="hope-cornea-sheen hope-layer" />
        </div>

        {/* --- 3) IRIS (ring + spokes) --- */}
        <div
          className="absolute rounded-full overflow-hidden hope-iris hope-layer"
          style={{
            width: iris,
            height: iris,
            left: (s - iris) / 2,
            top: (s - iris) / 2,
            boxShadow: `inset 0 0 ${Math.round(18 * intensity)}px rgba(255,255,255,.18)`,
          }}
        >
          <div className="hope-iris-ring hope-layer" />
          <div className="hope-iris-spokes hope-layer" />
        </div>

        {/* --- 4) LUMINOUS CORE (pupil) --- */}
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

        {/* --- 5) SPECULAR HIGHLIGHT (slight up-left for catch-light) --- */}
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

      {label && <div className="mt-2 text-xs md:text-sm opacity-80">{label}</div>}
    </div>
  );
}
