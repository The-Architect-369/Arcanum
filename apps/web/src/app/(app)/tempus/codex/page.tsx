'use client';

import ModuleTabRail from '@/components/ui/ModuleTabRail';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import PanelShell from '@/components/ui/PanelShell';
import AppStage from '@/components/ui/AppStage';
import { useTempusWindow } from '@/hooks/useTempusWindow';
import { TempusCodexLibrary } from '../_components/TempusContent';

const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calendar'] as const;
const TABS = [
  { href: ORDER[0], label: 'Codex' },
  { href: ORDER[1], label: 'Clock' },
  { href: ORDER[2], label: 'Calendar' },
] as const;

export default function TempusCodexPage() {
  const w = useTempusWindow();

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell
          tabs={<ModuleTabRail tabs={TABS} />}
          title={<h1 className="text-lg font-semibold">Tempus — Codex</h1>}
          actions={<div className="text-xs text-zinc-400">Correspondence library</div>}
          flush
          className="min-h-0 flex-1"
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Reference tables for the rhythms used by the Clock and Calendar. Active correspondences are highlighted.
            </p>
            <TempusCodexLibrary current={w} />
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
