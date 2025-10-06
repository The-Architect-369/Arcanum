'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { LockHint } from '@/components/shared/LockHint';

// Keep PATH in the middle position
const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'];

export default function VitaeMasteryPage() {
  return (
    <SwipeRoutes order={ORDER}>
      <TabDots
        tabs={[
          { href: ORDER[0], aria: 'Grade' },
          { href: ORDER[1], aria: 'Path' },
          { href: ORDER[2], aria: 'Mastery' },
        ]}
      />
      <div className="mx-auto max-w-5xl px-3 py-4">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="text-lg font-semibold">Vitae — Mastery</h1>
          <LockHint label="ACC to track progress & MANA" />
        </div>
        <p className="text-sm text-zinc-300">Mastery ledger (guest preview).</p>
      </div>
    </SwipeRoutes>
  );
}
