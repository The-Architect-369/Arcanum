'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';

// Keep PATH in the middle position
const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'];

export default function VitaePathPage() {
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
        <h1 className="mb-2 text-lg font-semibold">Vitae — Path</h1>
        <p className="text-sm text-zinc-300">Choose a specialization path (guest: browse only).</p>
      </div>
    </SwipeRoutes>
  );
}
