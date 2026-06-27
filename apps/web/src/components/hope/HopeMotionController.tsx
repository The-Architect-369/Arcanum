'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { HopeVisualState } from '@/lib/hope/visual';

export function HopeMotionController({
  visualState,
  children,
}: {
  visualState: HopeVisualState;
  children: ReactNode;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const animation = useMemo(() => {
    if (reducedMotion) return 'none';
    if (visualState.motion.profile === 'transitional') {
      return `hope-presence-breathe ${visualState.motion.breathMs}ms ease-in-out infinite, hope-presence-drift ${Math.max(4200, visualState.motion.transitionMs * 8)}ms ease-in-out infinite`;
    }
    return `hope-presence-breathe ${visualState.motion.breathMs}ms ease-in-out infinite`;
  }, [reducedMotion, visualState.motion.breathMs, visualState.motion.profile, visualState.motion.transitionMs]);

  return (
    <div
      style={{
        ['--hope-motion-breathe-scale' as string]: reducedMotion ? '1' : String(1 + visualState.aura.bloom * 0.06),
        ['--hope-motion-drift-y' as string]: reducedMotion
          ? '0px'
          : visualState.motion.drift === 'medium'
            ? '-6px'
            : visualState.motion.drift === 'low'
              ? '-3px'
              : '0px',
        animation,
      }}
      className="will-change-transform motion-reduce:transform-none"
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
    >
      {children}
    </div>
  );
}
