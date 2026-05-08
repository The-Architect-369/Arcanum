'use client';

import { useState } from 'react';
import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { LockHint } from '@/components/shared/LockHint';
import CTAActivate from '@/components/shared/CTAActivate';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import AppStage from '@/components/ui/AppStage';

const ORDER = ['/hope/presence', '/hope/reflection', '/hope/attunement'] as const;
const PRESETS = ['quiet', 'steady', 'warm', 'deep'] as const;

export default function HopeAttunementPage() {
  const [tone, setTone] = useState('#9bb8ff');
  const [presence, setPresence] = useState(35);
  const [frequency, setFrequency] = useState(30);
  const [depth, setDepth] = useState(45);
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>('quiet');

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <TabDots
          tabs={[
            { href: ORDER[0], aria: 'Presence' },
            { href: ORDER[1], aria: 'Reflection' },
            { href: ORDER[2], aria: 'Attunement' },
          ]}
        />

        <PanelShell title="Hope — Attunement" flush className="flex-1">
          <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-4">
              <div
                className="grid aspect-square place-items-center rounded-xl border border-white/10"
                style={{ background: tone }}
              >
                <div className="px-4 text-center text-xs uppercase tracking-wide text-black/70">
                  {preset} · p:{presence} · f:{frequency} · d:{depth}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {PRESETS.map((name) => (
                  <button
                    key={name}
                    onClick={() => setPreset(name)}
                    className={`rounded-md border px-3 py-1.5 text-xs uppercase ${
                      preset === name
                        ? 'border-amber-400 bg-blue-700 text-amber-300'
                        : 'border-zinc-600 bg-neutral-900/60 text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <PanelSection title="Presence Tone">
                <input
                  type="color"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="h-9 w-16 rounded-md border border-white/15 bg-white/10"
                />
              </PanelSection>

              <PanelSection title="Presence Level">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={presence}
                  onChange={(e) => setPresence(Number(e.target.value))}
                  className="w-full"
                />
              </PanelSection>

              <PanelSection title="Reflection Frequency">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="w-full"
                />
              </PanelSection>

              <PanelSection title="Reflection Depth">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="w-full"
                />
              </PanelSection>

              <div className="flex items-center gap-3">
                <LockHint label="ACC to save" />
                <CTAActivate />
              </div>
            </div>
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
