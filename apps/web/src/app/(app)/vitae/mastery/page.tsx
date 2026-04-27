'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import AppStage from '@/components/ui/AppStage';
import PanelShell from '@/components/ui/PanelShell';
import { LockHint } from '@/components/shared/LockHint';

const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'] as const;

export default function VitaeMasteryPage() {
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
        <PanelShell
          title={
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">Vitae — Mastery</h1>
              <LockHint label="ACC to track progress & MANA" />
            </div>
          }
          flush
          className="flex-1"
        >
          <p className="text-sm text-zinc-300">Mastery ledger (guest preview).</p>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
