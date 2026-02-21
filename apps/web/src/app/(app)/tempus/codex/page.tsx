'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import PanelShell from '@/components/ui/PanelShell';
import { useTempusWindow } from '@/hooks/useTempusWindow';

const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calender'];

export default function TempusCodexPage() {
  const w = useTempusWindow();

  return (
    <SwipeRoutes order={ORDER}>
      <TabDots
        tabs={[
          { href: ORDER[0], aria: 'Codex' },
          { href: ORDER[1], aria: 'Clock' },
          { href: ORDER[2], aria: 'Calendar' },
        ]}
      />

      <div className="mx-auto max-w-5xl px-3 py-4">
        <PanelShell
          title={<h1 className="text-lg font-semibold">Tempus — Codex</h1>}
          actions={<div className="text-xs text-zinc-400">Hybrid MVP (tables now, engine later)</div>}
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Correspondences for planetary, lunar, and zodiac cycles. This phase is informational and non-coercive.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card label="Zodiac Month (Cusps)" value={`${w.zodiacSign} · Day ${w.zodiacDay}`} />
              <Card label="Lunar Phase (8-step)" value={w.lunarPhase} />
              <Card label="Moon Sign (2.5-day steps)" value={w.moonZodiac} />
              <Card label="Planetary Day" value={`${w.planetaryDay} (${w.isDay ? 'Day' : 'Night'})`} />
            </div>

            <p className="text-xs text-zinc-400">
              Seam for later: replace cusp + new-moon tables with an ephemeris/astronomy engine (server route or library),
              while keeping this API stable.
            </p>
          </div>
        </PanelShell>
      </div>
    </SwipeRoutes>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="mt-1 text-sm text-zinc-100">{value}</div>
    </div>
  );
}