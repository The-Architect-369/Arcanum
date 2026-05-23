'use client';

import { useState } from 'react';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { LockHint } from '@/components/shared/LockHint';
import CTAActivate from '@/components/shared/CTAActivate';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import AppStage from '@/components/ui/AppStage';
import { ReflectionEditor } from '../_components/ReflectionEditor';
import HopeTabRail from '../_components/HopeTabRail';

const ORDER = ['/hope/presence', '/hope/reflection', '/hope/attunement'] as const;
const TABS = [
  { href: ORDER[0], label: 'Presence' },
  { href: ORDER[1], label: 'Reflection' },
  { href: ORDER[2], label: 'Attunement' },
] as const;

export default function HopeReflectionPage() {
  const [chatTab, setChatTab] = useState<'new' | 'logs'>('new');

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage className="items-center">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col">
          <PanelShell
             tabs={<HopeTabRail tabs={TABS} />}
            title="Hope — Reflection"
            flush
            className="min-h-0 flex-1 max-w-4xl"
            contentClassName="h-full"
          >
            <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="min-h-0 space-y-4">
                <PanelSection title="Leave a Reflection">
                  <ReflectionEditor />
                </PanelSection>

                <PanelSection title="Guidance Posture">
                  <p className="text-sm text-zinc-300">
                    Reflection is user-initiated. Hope may clarify, mirror, and respond, but it
                    does not command.
                  </p>
                </PanelSection>
              </div>

              <div className="min-h-0 flex flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <button
                    onClick={() => setChatTab('new')}
                    className={`rounded-md border px-3 py-1.5 text-xs ${
                      chatTab === 'new'
                        ? 'border-amber-400 bg-blue-700 text-amber-300'
                        : 'border-zinc-600 bg-neutral-900/60 text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => setChatTab('logs')}
                    className={`rounded-md border px-3 py-1.5 text-xs ${
                      chatTab === 'logs'
                        ? 'border-amber-400 bg-blue-700 text-amber-300'
                        : 'border-zinc-600 bg-neutral-900/60 text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    Logs
                  </button>
                  {chatTab === 'logs' && <LockHint label="ACC required" />}
                </div>

                {chatTab === 'new' ? (
                  <div className="min-h-0 flex flex-1 flex-col">
                    <PanelSection title="Speak with Hope" className="flex min-h-0 flex-1 flex-col">
                      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400">
                        <div className="opacity-70">Your conversation with Hope will appear here.</div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          placeholder="Speak with Hope…"
                          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none"
                        />
                        <button className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">Send</button>
                      </div>
                    </PanelSection>
                  </div>
                ) : (
                  <PanelSection title="Reflection Logs" className="min-h-0 flex-1">
                    <div className="text-sm text-zinc-400">
                      Logs are available after ACC activation.
                    </div>
                    <div className="mt-3">
                      <CTAActivate />
                    </div>
                  </PanelSection>
                )}
              </div>
            </div>
          </PanelShell>
        </div>
      </AppStage>
    </SwipeRoutes>
  );
}
