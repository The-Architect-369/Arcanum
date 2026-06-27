'use client';

import type { HopeVisualState } from '@/lib/hope/visual';

export function HopePresenceField({ visualState }: { visualState: HopeVisualState }) {
  const particleCount = visualState.environment.particleDensity === 'soft' ? 7 : visualState.environment.particleDensity === 'low' ? 4 : 0;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            visualState.environment.backgroundField === 'attuned'
              ? `radial-gradient(circle at 50% 35%, ${visualState.palette.field} 0%, rgba(15,23,42,0.24) 46%, rgba(2,6,23,0.12) 100%)`
              : visualState.environment.backgroundField === 'breathing'
                ? `radial-gradient(circle at 50% 40%, ${visualState.palette.field} 0%, rgba(15,23,42,0.18) 52%, rgba(2,6,23,0.08) 100%)`
                : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04), rgba(2,6,23,0.04) 60%, transparent 100%)',
        }}
      />
      {Array.from({ length: particleCount }).map((_, index) => {
        const size = 4 + ((index * 3) % 6);
        const left = 12 + index * 11;
        const top = 14 + ((index * 13) % 58);
        return (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: 'rgba(255,255,255,0.32)',
              boxShadow: `0 0 12px ${visualState.palette.aura}`,
              opacity: 0.45 - index * 0.04,
            }}
          />
        );
      })}
      {visualState.environment.focusVignette === 'present' ? (
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 0 42%, rgba(2,6,23,0.22) 74%, rgba(2,6,23,0.48) 100%)' }} />
      ) : null}
    </div>
  );
}
