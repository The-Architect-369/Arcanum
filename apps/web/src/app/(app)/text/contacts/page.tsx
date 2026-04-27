'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import AppStage from '@/components/ui/AppStage';
import PanelShell from '@/components/ui/PanelShell';

const ORDER = ['/text/contacts', '/text/messages', '/text/groups'] as const;

export default function TextContactsPage() {
  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <TabDots
          tabs={[
            { href: ORDER[0], aria: 'Contacts' },
            { href: ORDER[1], aria: 'Messages' },
            { href: ORDER[2], aria: 'Groups' },
          ]}
        />
        <PanelShell title="Text — Contacts" flush className="flex-1">
          <p className="text-sm text-zinc-300">
            Your address book preview. ACC syncs Chain Code links.
          </p>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
