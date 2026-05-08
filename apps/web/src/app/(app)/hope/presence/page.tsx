'use client';

import Link from 'next/link';
import AppStage from '@/components/ui/AppStage';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import CTAActivate from '@/components/shared/CTAActivate';
import HopeTabRail from '../_components/HopeTabRail';

const ORDER = ['/hope/presence', '/hope/reflection', '/hope/attunement'] as const;
const TABS = [
  { href: ORDER[0], label: 'Presence' },
  { href: ORDER[1], label: 'Reflection' },
  { href: ORDER[2], label: 'Attunement' },
] as const;

export default function HopePresencePage() {
  return (
    <SwipeRoutes order={ORDER}>
      <AppStage className="items-center">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col">
          <HopeTabRail tabs={TABS} />

          <PanelShell
            title="Hope — Presence"
            flush
            className="min-h-0 flex-1 max-w-4xl"
            contentClassName="h-full"
          >
            <div className="grid h-full gap-4 md:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-4">
                <p className="text-sm text-zinc-300">
                  Hope is present as a calm threshold. You are not required to speak, perform,
                  or decide immediately.
                </p>

                <PanelSection title="Orientation">
                  <div className="space-y-3 text-sm text-zinc-300">
                    <p>
                      Presence is Hope in its quietest form: available, non-intrusive, and free
                      from pressure loops.
                    </p>
                    <p>
                      You may continue to Reflection when you want dialogue, or open Attunement
                      when you want to adjust how Hope appears and responds.
                    </p>
                  </div>
                </PanelSection>

                <PanelSection title="Current Posture">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">Mode</div>
                      <div className="mt-1 text-sm text-zinc-100">Pulse</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">Demand</div>
                      <div className="mt-1 text-sm text-zinc-100">None</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">Witness</div>
                      <div className="mt-1 text-sm text-zinc-100">Optional</div>
                    </div>
                  </div>
                </PanelSection>
              </div>

              <div className="space-y-4">
                <PanelSection title="Next">
                  <div className="space-y-3">
                    <Link
                      href="/hope/reflection"
                      className="block rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
                    >
                      Enter Reflection
                    </Link>
                    <Link
                      href="/hope/attunement"
                      className="block rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
                    >
                      Open Attunement
                    </Link>
                  </div>
                </PanelSection>

                <PanelSection title="Activation">
                  <CTAActivate />
                </PanelSection>
              </div>
            </div>
          </PanelShell>
        </div>
      </AppStage>
    </SwipeRoutes>
  );
}
