'use client';

import type { HopeVisualState } from '@/lib/hope/visual';
import { HopePresenceAura } from './HopePresenceAura';
import { HopePresenceCore } from './HopePresenceCore';

export function HopePresenceAvatar({ visualState, size = 220 }: { visualState: HopeVisualState; size?: number }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <HopePresenceAura visualState={visualState} size={size} />
      <HopePresenceCore visualState={visualState} size={size} />
    </div>
  );
}
