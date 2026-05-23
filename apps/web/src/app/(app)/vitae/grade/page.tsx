'use client';

import ModuleTabRail from '@/components/ui/ModuleTabRail';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import AppStage from '@/components/ui/AppStage';
import PanelShell from '@/components/ui/PanelShell';

const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'] as const;
const TABS = [
  { href: ORDER[0], label: 'Grade' },
  { href: ORDER[1], label: 'Path' },
  { href: ORDER[2], label: 'Mastery' },
] as const;

export default function VitaeGradePage() {
  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell tabs={<ModuleTabRail tabs={TABS} />} title="Vitae — Grade" flush className="flex-1">
          <p className="text-sm text-zinc-300">
            Grade 1: The Guardian — core practices preview.
          </p>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
