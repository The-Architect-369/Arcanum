'use client';

import { useState } from 'react';
import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { LockHint } from '@/components/shared/LockHint';
import CTAActivate from '@/components/shared/CTAActivate';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';

const ORDER = ['/hope/inventory', '/hope/character', '/hope/stylize'] as const;
const MATERIALS = ['wood', 'garnet', 'knitted', 'cotton'] as const;

export default function HopeStylizePage() {
  const [color, setColor] = useState('#9bb8ff');
  const [height, setHeight] = useState(50);
  const [weight, setWeight] = useState(50);
  const [mat, setMat] = useState<(typeof MATERIALS)[number]>('wood');

  return (
    <SwipeRoutes order={ORDER}>
      <div className="min-h-[calc(100dvh-7rem)] flex flex-col">
        <TabDots
          tabs={[
            { href: ORDER[0], aria: 'Inventory' },
            { href: ORDER[1], aria: 'Character' },
            { href: ORDER[2], aria: 'Stylize' },
          ]}
        />

        {/* Single full-height tile that contains stripped avatar editor + materials tray */}
        <PanelShell title="Hope — Stylize" flush className="flex-1">
          <div className="h-full grid grid-rows-[auto_1fr] gap-4">
            {/* TOP: Stripped avatar editor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="aspect-square rounded-xl border border-white/10 grid place-items-center"
                style={{ background: color }}
              >
                <div className="text-xs text-black/70 uppercase tracking-wide">
                  {mat} • h:{height} • w:{weight}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <PanelSection title="Color">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-9 w-16 rounded-md border border-white/15 bg-white/10"
                  />
                </PanelSection>
                <PanelSection title="Height">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full"
                  />
                </PanelSection>
                <PanelSection title="Weight">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full"
                  />
                </PanelSection>
                <div className="flex items-center gap-3">
                  <LockHint label="ACC to save" />
                  <CTAActivate />
                </div>
              </div>
            </div>

            {/* BOTTOM: Materials tray (fills remaining height, scrolls inside tile) */}
            <div className="min-h-0 flex flex-col">
              <div className="mb-3 flex flex-wrap gap-2">
                {MATERIALS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMat(m)}
                    className={`rounded-md border px-3 py-1.5 text-xs uppercase ${
                      mat === m
                        ? 'bg-blue-700 text-amber-300 border-amber-400'
                        : 'bg-neutral-900/60 text-zinc-300 border-zinc-600 hover:bg-white/5'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <PanelSection title="Preview Slots" className="min-h-0 flex-1">
                <div className="h-full overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl border border-white/10 bg-white/[0.03] grid place-items-center text-xs text-white/60"
                    >
                      Empty
                    </div>
                  ))}
                </div>
              </PanelSection>
            </div>
          </div>
        </PanelShell>
      </div>
    </SwipeRoutes>
  );
}
