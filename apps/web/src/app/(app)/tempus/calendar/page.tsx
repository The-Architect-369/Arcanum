'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import PanelShell from '@/components/ui/PanelShell';
import { computeWindowState } from '@/lib/tempus/window';

const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calender']; // keep folder spelling

function labelPhase(phase: 'open' | 'rest' | 'silent') {
  return phase === 'open' ? 'Open' : phase === 'rest' ? 'Resting' : 'Silent';
}

export default function TempusCalendarPage() {
  const now = new Date();

  // Gentle “next 24h” sketch without countdown framing: sample every 6 hours
  const blocks = [0, 6, 12, 18].map((h) => {
    const d = new Date(now.getTime() + h * 3600_000);
    const w = computeWindowState(d);
    return {
      when: d,
      phase: w.phase,
      label: `${w.planetaryDay} ${w.isDay ? 'Day' : 'Night'}`,
      zodiac: `${w.zodiacSign} ${w.zodiacDay}`,
      lunar: w.lunarPhase,
    };
  });

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
          title={<h1 className="text-lg font-semibold">Tempus — Calendar</h1>}
          actions={<div className="text-xs text-zinc-400">Next 24h (sampled, non-coercive)</div>}
        >
          <div className="space-y-3">
            <p className="text-sm text-zinc-300">
              A gentle view of windows. No deadlines. No penalties. Participation is optional.
            </p>

            <div className="grid gap-3">
              {blocks.map((b, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-zinc-100">{b.label}</div>
                    <div className="text-xs text-zinc-300">{labelPhase(b.phase)}</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {b.when.toLocaleString()} · {b.zodiac} · {b.lunar}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-400">
              This is an MVP view; we can later add a fuller dial visualization without introducing urgency mechanics.
            </p>
          </div>
        </PanelShell>
      </div>
    </SwipeRoutes>
  );
}