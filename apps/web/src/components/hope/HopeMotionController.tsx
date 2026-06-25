'use client';

import type { ReactNode } from 'react';
import type { HopeVisualState } from '@/lib/hope/visual';

export function HopeMotionController({
  visualState,
  children,
}: {
  visualState: HopeVisualState;
  children: ReactNode;
}) {
  const animation =
    visualState.motion.profile === 'active'
      ? `hope-presence-breathe ${visualState.motion.breathMs}ms ease-in-out infinite`
      : visualState.motion.profile === 'transitional'
        ? `hope-presence-breathe ${visualState.motion.breathMs}ms ease-in-out infinite, hope-presence-drift ${Math.max(4200, visualState.motion.transitionMs * 8)}ms ease-in-out infinite`
        : `hope-presence-breathe ${visualState.motion.breathMs}ms ease-in-out infinite`;

  return (
    <div
      style={{
        ['--hope-motion-breathe-scale' as string]: String(1 + (visualState.aura.bloom * 0.06)),
        ['--hope-motion-drift-y' as string]: visualState.motion.drift === 'medium' ? '-6px' : visualState.motion.drift === 'low' ? '-3px' : '0px',
        animation,
      }}
      className="will-change-transform"
    >
      {children}
    </div>
  );
}
