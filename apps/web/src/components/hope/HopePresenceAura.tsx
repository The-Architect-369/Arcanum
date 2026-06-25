'use client';

import type { HopeVisualState } from '@/lib/hope/visual';

export function HopePresenceAura({ visualState, size }: { visualState: HopeVisualState; size: number }) {
  const ringBase = Math.round(size * 0.68);

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          filter: `drop-shadow(0 0 ${Math.round(visualState.aura.radius * 0.5)}px ${visualState.palette.aura})`,
          opacity: Math.max(0.2, visualState.aura.intensity),
        }}
      />
      {Array.from({ length: visualState.aura.ringCount }).map((_, index) => {
        const sizeOffset = index * 18;
        const ringSize = ringBase + sizeOffset;
        const inset = (size - ringSize) / 2;
        return (
          <div
            key={index}
            className="absolute rounded-full border"
            style={{
              inset,
              borderColor: 'rgba(255,255,255,0.12)',
              boxShadow: `0 0 ${16 + index * 10}px ${visualState.palette.aura}`,
              opacity: Math.max(0.14, 0.34 - index * 0.07),
              transform: `scale(${1 + index * 0.025})`,
            }}
          />
        );
      })}
    </div>
  );
}
