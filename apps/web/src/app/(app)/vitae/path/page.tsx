'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import AppStage from '@/components/ui/AppStage';
import PanelShell from '@/components/ui/PanelShell';

const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'] as const;

export default function VitaePathPage() {
  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <TabDots
          tabs={[
            { href: ORDER[0], aria: 'Grade' },
            { href: ORDER[1], aria: 'Path' },
            { href: ORDER[2], aria: 'Mastery' },
          ]}
        />
        <PanelShell title="Vitae — Path" flush className="flex-1">
          <p className="text-sm text-zinc-300">
            Choose a specialization path (guest: browse only).
          </p>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
