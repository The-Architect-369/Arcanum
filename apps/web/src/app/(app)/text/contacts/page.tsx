'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';

const ORDER = ['/text/contacts', '/text/messages', '/text/groups'];

export default function TextContactsPage() {
  return (
    <SwipeRoutes order={ORDER}>
      <TabDots
        tabs={[
          { href: ORDER[0], aria: 'Contacts' },
          { href: ORDER[1], aria: 'Messages' },
          { href: ORDER[2], aria: 'Groups' },
        ]}
      />
      <div className="mx-auto max-w-5xl px-3 py-4">
        <h1 className="mb-2 text-lg font-semibold">Text — Contacts</h1>
        <p className="text-sm text-zinc-300">Your address book preview. ACC syncs Chain Code links.</p>
      </div>
    </SwipeRoutes>
  );
}
