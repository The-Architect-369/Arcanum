'use client';

import { useEffect, useMemo, useState } from 'react';
import ModuleTabRail from '@/components/ui/ModuleTabRail';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import AppStage from '@/components/ui/AppStage';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import CTAActivate from '@/components/shared/CTAActivate';
import { LockHint } from '@/components/shared/LockHint';
import { getVitaeState, recordVitaeSession, summarizeVitae, VITAE_PRACTICES } from '@/lib/mobile/vitae';
import { useAccount } from '@/state/useAccount';

const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'] as const;
const TABS = [
  { href: ORDER[0], label: 'Grade' },
  { href: ORDER[1], label: 'Path' },
  { href: ORDER[2], label: 'Mastery' },
] as const;

export default function VitaeMasteryPage() {
  const account = useAccount();
  const [practiceId, setPracticeId] = useState(VITAE_PRACTICES[0].id);
  const [minutes, setMinutes] = useState(String(VITAE_PRACTICES[0].suggestedMinutes));
  const [notes, setNotes] = useState('');
  const [state, setState] = useState<Awaited<ReturnType<typeof getVitaeState>> | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadState() {
    const next = await getVitaeState();
    setState(next);
  }

  useEffect(() => {
    void loadState();
  }, []);

  const summary = useMemo(() => summarizeVitae(state ?? { selectedPath: null, sessions: [], updatedAt: null }), [state]);

  async function logSession() {
    if (!account.trusted) {
      setMessage('Activate on this device to record Vitae sessions.');
      return;
    }

    await recordVitaeSession({
      practiceId,
      minutes: Number(minutes) || 0,
      notes,
    });

    setNotes('');
    setMessage('Recorded a Vitae practice session on this device.');
    await loadState();
  }

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell
          tabs={<ModuleTabRail tabs={TABS} />}
          title={
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">Vitae — Mastery</h1>
              <LockHint label="Device ledger" />
            </div>
          }
          flush
          className="flex-1"
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Mastery is a local ledger of completed practice, not a claim of superiority. It helps
              the device remember what has already been done.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Band" value={summary.band} />
              <MetricCard label="Sessions" value={String(summary.sessionCount)} />
              <MetricCard label="Minutes" value={String(summary.totalMinutes)} />
            </div>

            {!account.trusted && (
              <PanelSection title="Setup required to save sessions">
                <div className="space-y-3 text-sm text-zinc-300">
                  <p>You can browse the ledger shape freely. Saving local sessions requires setup.</p>
                  <CTAActivate />
                </div>
              </PanelSection>
            )}

            <PanelSection title="Record practice session">
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-zinc-500">Practice</span>
                    <select
                      value={practiceId}
                      onChange={(event) => setPracticeId(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
                    >
                      {VITAE_PRACTICES.map((practice) => (
                        <option key={practice.id} value={practice.id}>
                          {practice.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-zinc-500">Minutes</span>
                    <input
                      value={minutes}
                      onChange={(event) => setMinutes(event.target.value)}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
                    />
                  </label>
                </div>
                <label className="space-y-1 block">
                  <span className="text-xs uppercase tracking-wide text-zinc-500">Notes</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
                    placeholder="Optional reflection or what was practiced"
                  />
                </label>
                <button
                  onClick={() => {
                    void logSession();
                  }}
                  className="rounded-xl border border-amber-300/40 px-4 py-2 text-sm text-amber-300 hover:bg-amber-300/10"
                >
                  Record session
                </button>
                {message && <p>{message}</p>}
              </div>
            </PanelSection>

            <PanelSection title="Recent sessions">
              <div className="space-y-3">
                {(state?.sessions ?? []).length === 0 ? (
                  <div className="text-sm text-zinc-400">No Vitae sessions recorded yet.</div>
                ) : (
                  state?.sessions.map((session) => {
                    const practice = VITAE_PRACTICES.find((item) => item.id === session.practiceId);
                    return (
                      <article key={session.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <span>{practice?.title ?? session.practiceId}</span>
                          <span>•</span>
                          <span>{session.minutes} min</span>
                          <span>•</span>
                          <span>{new Date(session.completedAt).toLocaleString()}</span>
                        </div>
                        {session.notes && <div className="mt-2 text-sm text-zinc-300">{session.notes}</div>}
                      </article>
                    );
                  })
                )}
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
