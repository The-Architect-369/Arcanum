'use client';

import { useEffect, useState } from 'react';
import ModuleTabRail from '@/components/ui/ModuleTabRail';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import AppStage from '@/components/ui/AppStage';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import CTAActivate from '@/components/shared/CTAActivate';
import { LockHint } from '@/components/shared/LockHint';
import { getVitaeState, selectVitaePath, VITAE_PATHS, type VitaePathKey } from '@/lib/mobile/vitae';
import { useAccount } from '@/state/useAccount';

const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'] as const;
const TABS = [
  { href: ORDER[0], label: 'Grade' },
  { href: ORDER[1], label: 'Path' },
  { href: ORDER[2], label: 'Mastery' },
] as const;

export default function VitaePathPage() {
  const account = useAccount();
  const [selected, setSelected] = useState<VitaePathKey | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const state = await getVitaeState();
      if (active) setSelected(state.selectedPath);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function choosePath(path: VitaePathKey) {
    if (!account.trusted) {
      setMessage('Activate on this device to save a Vitae path.');
      return;
    }
    await selectVitaePath(path);
    setSelected(path);
    setMessage(`Saved ${path} as the current Vitae path on this device.`);
  }

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell tabs={<ModuleTabRail tabs={TABS} />} title="Vitae — Path" flush className="flex-1">
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Choose a path for local practice emphasis. Browsing remains open; saving the choice on
              this device requires setup.
            </p>

            {!account.trusted && (
              <PanelSection title="Device setup required to save">
                <div className="space-y-3 text-sm text-zinc-300">
                  <p>You can browse all paths freely. Saving a choice locally requires setup.</p>
                  <CTAActivate />
                </div>
              </PanelSection>
            )}

            <div className="grid gap-3 lg:grid-cols-3">
              {VITAE_PATHS.map((path) => {
                const active = selected === path.key;
                return (
                  <article key={path.key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-medium text-zinc-100">{path.title}</h2>
                      {active && <LockHint label="Selected" />}
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">{path.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {path.emphasis.map((item) => (
                        <span key={item} className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300">
                          {item}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        void choosePath(path.key);
                      }}
                      className="mt-4 rounded-xl border border-amber-300/40 px-4 py-2 text-sm text-amber-300 hover:bg-amber-300/10"
                    >
                      {active ? 'Selected' : 'Choose path'}
                    </button>
                  </article>
                );
              })}
            </div>

            {message && <div className="text-sm text-zinc-300">{message}</div>}
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
