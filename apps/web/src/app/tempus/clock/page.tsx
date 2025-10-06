'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';

const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calender']; // keep folder spelling

export default function TempusClockPage() {
  return (
    <SwipeRoutes order={ORDER}>
      <TabDots
        tabs={[
          { href: ORDER[0], aria: 'Codex' },
          { href: ORDER[1], aria: 'Clock' },
          { href: ORDER[2], aria: 'Calendar' },
        ]}
      />
      <div className="mx-auto max-w-5xl px-3 py-4">
        <h1 className="mb-2 text-lg font-semibold">Tempus — Clock</h1>
        <p className="text-sm text-zinc-300">Geocentric clock preview (guest). ACC unlocks rituals & timers.</p>
      </div>
    </SwipeRoutes>
  );
}
