'use client';

import { useEffect, useState } from 'react';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { LockHint } from '@/components/shared/LockHint';
import CTAActivate from '@/components/shared/CTAActivate';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import AppStage from '@/components/ui/AppStage';
import { getHopeState } from '@/lib/hope/context';
import { useAccount } from '@/state/useAccount';
import { ReflectionEditor } from '../_components/ReflectionEditor';
import HopeTabRail from '../_components/HopeTabRail';

const ORDER = ['/hope/presence', '/hope/reflection', '/hope/attunement'] as const;
const TABS = [
  { href: ORDER[0], label: 'Presence' },
  { href: ORDER[1], label: 'Reflection' },
  { href: ORDER[2], label: 'Attunement' },
] as const;

export default function HopeReflectionPage() {
  const account = useAccount();
  const [chatTab, setChatTab] = useState<'new' | 'logs'>('new');
  const [hopeState, setHopeState] = useState<Awaited<ReturnType<typeof getHopeState>> | null>(null);

  async function loadHopeState() {
    const next = await getHopeState();
    setHopeState(next);
  }

  useEffect(() => {
    void loadHopeState();
  }, []);

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
                  <ReflectionEditor onRecorded={() => void loadHopeState()} />
                </PanelSection>

                <PanelSection title="Guidance Posture">
                  <p className="text-sm text-zinc-300">
                    Reflection is user-initiated. Hope may clarify, mirror, and respond, but it
                    does not command, execute, ratify, or confirm readiness.
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
                  {chatTab === 'logs' && <LockHint label="Local private" />}
                </div>

                {chatTab === 'new' ? (
                  <div className="min-h-0 flex flex-1 flex-col">
                    <PanelSection title="Speak with Hope" className="flex min-h-0 flex-1 flex-col">
                      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400">
                        <div className="opacity-70">
                          Hope reflection records are local advisory context. They are not governance decisions,
                          diagnoses, or authority assignments.
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-zinc-500">
                        Conversational response generation is not enabled in this scaffold.
                      </div>
                    </PanelSection>
                  </div>
                ) : !account.trusted ? (
                  <PanelSection title="Reflection Logs" className="min-h-0 flex-1">
                    <div className="text-sm text-zinc-400">
                      Logs are local-private and available after ACC activation.
                    </div>
                    <div className="mt-3">
                      <CTAActivate />
                    </div>
                  </PanelSection>
                ) : (
                  <PanelSection title="Reflection Logs" className="min-h-0 flex-1">
                    <div className="space-y-3">
                      {(hopeState?.reflections ?? []).length === 0 ? (
                        <div className="text-sm text-zinc-400">No local Hope reflections recorded yet.</div>
                      ) : (
                        hopeState?.reflections.map((reflection) => (
                          <article key={reflection.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                              <span>{reflection.mode}</span>
                              <span>•</span>
                              <span>{new Date(reflection.createdAt).toLocaleString()}</span>
                              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase">
                                {reflection.authority}
                              </span>
                            </div>
                            <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{reflection.userText}</div>
                            {(reflection.context?.tempus || reflection.context?.vitae) && (
                              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-2 text-xs text-zinc-400">
                                <div className="font-medium text-zinc-300">Attached local context</div>
                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                  {reflection.context.tempus && (
                                    <>
                                      <span>{reflection.context.tempus.phase} window</span>
                                      <span>{reflection.context.tempus.solar.season}</span>
                                      <span>{reflection.context.tempus.lunar.phase}</span>
                                    </>
                                  )}
                                  {reflection.context.vitae && (
                                    <>
                                      <span>Vitae sessions: {reflection.context.vitae.sessionCount}</span>
                                      <span>Path: {reflection.context.vitae.selectedPath ?? 'none'}</span>
                                    </>
                                  )}
                                </div>
                                <div className="mt-1 text-[11px] text-zinc-500">
                                  Context only; not interpretation, recognition, or authority.
                                </div>
                              </div>
                            )}
                          </article>
                        ))
                      )}
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
