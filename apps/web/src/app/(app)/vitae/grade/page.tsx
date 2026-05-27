'use client';

import { useEffect, useState } from 'react';
import ModuleTabRail from '@/components/ui/ModuleTabRail';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import AppStage from '@/components/ui/AppStage';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import { getVitaeState, summarizeVitae, VITAE_PRACTICES } from '@/lib/mobile/vitae';

const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'] as const;
const TABS = [
  { href: ORDER[0], label: 'Grade' },
  { href: ORDER[1], label: 'Path' },
  { href: ORDER[2], label: 'Mastery' },
] as const;

export default function VitaeGradePage() {
  const [summary, setSummary] = useState({
    band: 'Preview',
    sessionCount: 0,
    totalMinutes: 0,
    lastSessionAt: null as string | null,
    selectedPath: null as string | null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const state = await getVitaeState();
      const next = summarizeVitae(state);
      if (!active) return;
      setSummary({
        ...next,
        selectedPath: state.selectedPath,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell tabs={<ModuleTabRail tabs={TABS} />} title="Vitae — Grade" flush className="flex-1">
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Grade reflects the current practice band on this device. It does not imply worth,
              rank, or personal value.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Current band" value={summary.band} />
              <MetricCard label="Sessions" value={String(summary.sessionCount)} />
              <MetricCard label="Minutes" value={String(summary.totalMinutes)} />
              <MetricCard label="Path" value={summary.selectedPath ?? 'Not chosen'} />
            </div>

            <PanelSection title="Available practices">
              <div className="grid gap-3 md:grid-cols-3">
                {VITAE_PRACTICES.map((practice) => (
                  <div key={practice.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-sm font-medium text-zinc-100">{practice.title}</div>
                    <div className="mt-1 text-sm text-zinc-300">{practice.summary}</div>
                    <div className="mt-2 text-xs text-zinc-500">Suggested: {practice.suggestedMinutes} minutes</div>
                  </div>
                ))}
              </div>
            </PanelSection>

            <PanelSection title="Latest record">
              <div className="text-sm text-zinc-300">
                {summary.lastSessionAt
                  ? `Last practice recorded ${new Date(summary.lastSessionAt).toLocaleString()}.`
                  : 'No practice has been recorded on this device yet.'}
              </div>
            </PanelSection>
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-sm text-zinc-100">{value}</div>
    </div>
  );
}
