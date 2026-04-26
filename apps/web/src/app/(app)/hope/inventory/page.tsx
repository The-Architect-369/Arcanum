'use client';

import { useState } from 'react';
import TabDots from '@/components/ui/TabDots';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { LockHint } from '@/components/shared/LockHint';
import CTAActivate from '@/components/shared/CTAActivate';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import AppStage from '@/components/ui/AppStage';

const ORDER = ['/hope/inventory', '/hope/character', '/hope/stylize'];
const INV_TABS = ['items', 'auras', 'emotes', 'banners', 'backgrounds'] as const;
type InvKey = typeof INV_TABS[number];

export default function HopeInventoryPage() {
  const [tab, setTab] = useState<InvKey>('items');

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <TabDots
          tabs={[
            { href: ORDER[0], aria: 'Inventory' },
            { href: ORDER[1], aria: 'Character' },
            { href: ORDER[2], aria: 'Stylize' },
          ]}
        />

        <PanelShell title="Hope — Inventory" flush className="flex-1">
          <div className="mb-4 flex flex-wrap gap-2">
            {INV_TABS.map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-wide ${
                  tab === k
                    ? 'border-amber-400 bg-blue-700 text-amber-300 shadow-[0_0_12px_rgba(246,196,83,0.8)]'
                    : 'border-zinc-600 bg-neutral-900/60 text-zinc-300 hover:bg-white/5'
                }`}
              >
                {k}
              </button>
            ))}
            <div className="ml-auto">
              <LockHint label="ACC to claim/mint" />
            </div>
          </div>

          <PanelSection title="Collected">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="grid aspect-square place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-xs text-white/60"
                >
                  Empty
                </div>
              ))}
            </div>
          </PanelSection>

          <div className="mt-6">
            <CTAActivate />
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
