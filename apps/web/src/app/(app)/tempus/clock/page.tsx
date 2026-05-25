'use client';

import ModuleTabRail from '@/components/ui/ModuleTabRail';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import PanelShell from '@/components/ui/PanelShell';
import AppStage from '@/components/ui/AppStage';
import { useTempusWindow } from '@/hooks/useTempusWindow';
import { TempusClockFace } from '../_components/TempusContent';

const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calendar'] as const;
const TABS = [
  { href: ORDER[0], label: 'Codex' },
  { href: ORDER[1], label: 'Clock' },
  { href: ORDER[2], label: 'Calendar' },
] as const;

function PhasePill({ phase }: { phase: 'open' | 'rest' | 'silent' }) {
  const text = phase === 'open' ? 'Open' : phase === 'rest' ? 'Resting' : 'Silent';
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 px-2.5 py-1 text-xs text-zinc-100">
      {text}
    </span>
  );
}

export default function TempusClockPage() {
  const w = useTempusWindow();

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell
          tabs={<ModuleTabRail tabs={TABS} />}
          title={
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">Tempus — Clock</h1>
              <PhasePill phase={w.phase} />
            </div>
          }
          actions={<div className="text-xs text-zinc-400">{w.planetaryDay} {w.isDay ? 'Day' : 'Night'}</div>}
          flush
          className="min-h-0 flex-1"
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              A live rhythm dial for the current planetary, solar, lunar, and zodiac correspondences.
            </p>
            <TempusClockFace />
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
