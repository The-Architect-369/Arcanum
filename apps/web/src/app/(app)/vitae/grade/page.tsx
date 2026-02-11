'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';

// Keep PATH in the middle position
const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'];

export default function VitaeGradePage() {
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
        <h1 className="mb-2 text-lg font-semibold">Vitae — Grade</h1>
        <p className="text-sm text-zinc-300">Grade 1: The Guardian — core practices preview.</p>
      </div>
    </SwipeRoutes>
  );
}
