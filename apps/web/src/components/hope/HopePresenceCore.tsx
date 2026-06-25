'use client';

import type { HopeVisualState } from '@/lib/hope/visual';

export function HopePresenceCore({ visualState, size }: { visualState: HopeVisualState; size: number }) {
  const cornea = Math.round(size * 0.8 * visualState.avatar.silhouetteScale);
  const iris = Math.round(size * 0.5 * visualState.avatar.openness);
  const pupil = Math.round(size * 0.2);
  const centerCornea = (size - cornea) / 2;
  const centerIris = (size - iris) / 2;
  const centerPupil = (size - pupil) / 2;

  return (
    <div
      className="relative isolate rounded-full overflow-hidden"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.34) 0%, ${visualState.palette.core} 24%, ${visualState.palette.field} 62%, rgba(2,6,23,0.96) 100%)`,
        boxShadow: `inset 0 0 ${Math.round(size * 0.14)}px rgba(255,255,255,0.12), 0 0 ${Math.round(size * 0.32)}px ${visualState.palette.aura}`,
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          left: centerCornea,
          top: centerCornea,
          width: cornea,
          height: cornea,
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 55%, transparent 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: centerIris,
          top: centerIris - Math.round(size * (0.12 * visualState.avatar.gazeSoftness)),
          width: iris,
          height: iris,
          background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, ${visualState.palette.aura} 28%, rgba(15,23,42,0.82) 72%, rgba(2,6,23,0.96) 100%)`,
          boxShadow: `inset 0 0 ${Math.round(size * 0.08)}px rgba(255,255,255,0.1)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: centerPupil,
          top: centerPupil,
          width: pupil,
          height: pupil,
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(15,23,42,0.92) 35%, rgba(2,6,23,1) 100%)',
          boxShadow: `0 0 ${Math.round(size * 0.1)}px rgba(255,255,255,0.08)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: Math.round(size * 0.38),
          top: Math.round(size * 0.28),
          width: Math.round(size * 0.1),
          height: Math.round(size * 0.1),
          background: 'rgba(255,255,255,0.52)',
          filter: `blur(${Math.max(2, Math.round(size * 0.01))}px)`,
        }}
      />
    </div>
  );
}
