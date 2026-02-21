'use client';

import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import PanelShell from '@/components/ui/PanelShell';
import { useTempusWindow } from '@/hooks/useTempusWindow';

const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calender']; // keep folder spelling

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

  const headline =
    w.phase === 'open'
      ? 'The window is open.'
      : w.phase === 'rest'
        ? 'The window is resting.'
        : 'The system is silent.';

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
          title={
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">Tempus — Clock</h1>
              <PhasePill phase={w.phase} />
            </div>
          }
          actions={<div className="text-xs text-zinc-400">{w.planetaryDay} {w.isDay ? 'Day' : 'Night'}</div>}
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-200">{headline}</p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Card label="Planetary Day" value={w.planetaryDay} />
              <Card label="Day / Night" value={w.isDay ? 'Day' : 'Night'} />
              <Card label="Zodiac Month" value={`${w.zodiacSign} · Day ${w.zodiacDay}`} />
              <Card label="Lunar Phase" value={w.lunarPhase} />
              <Card label="Moon Sign (MVP)" value={w.moonZodiac} />
              <Card label="Window" value={w.phase === 'open' ? 'Open' : w.phase === 'rest' ? 'Resting' : 'Silent'} />
            </div>

            <p className="text-xs text-zinc-400">
              No countdowns. No streaks. Windows are rhythm, not pressure.
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