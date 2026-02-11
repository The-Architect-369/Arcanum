'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { LockHint } from '@/components/shared/LockHint';

const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calender'];

export default function TempusCalendarPage() {
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
        <div className="mb-3 flex items-center gap-3">
          <h1 className="text-lg font-semibold">Tempus — Calendar</h1>
          <LockHint label="ACC to save rituals & earn MANA" />
        </div>
        <p className="text-sm text-zinc-300">13-month and solar calendars with task hooks (guest: preview).</p>
      </div>
    </SwipeRoutes>
  );
}
