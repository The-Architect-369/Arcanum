#!/usr/bin/env python3

from pathlib import Path
import shutil
import textwrap

FILES = {
    "apps/web/src/app/(app)/hope/_lib/ipfs.ts": textwrap.dedent("""\
        export async function submitReflectionToIPFS(
          reflection: Record<string, unknown>
        ): Promise<string> {
          const res = await fetch("/api/ipfs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reflection),
          });

          if (!res.ok) {
            throw new Error("Failed to submit reflection to IPFS");
          }

          const data = await res.json();
          return data.cid;
        }
    """),

    "apps/web/src/app/(app)/hope/_components/ReflectionEditor.tsx": textwrap.dedent("""\
        "use client";

        import { useState } from "react";
        import { submitReflectionToIPFS } from "../_lib/ipfs";

        type Witness = {
          cid: string;
          createdAt: string;
        };

        export function ReflectionEditor() {
          const [text, setText] = useState("");
          const [submitting, setSubmitting] = useState(false);
          const [witnesses, setWitnesses] = useState<Witness[]>([]);

          const canSubmit = text.trim().length > 0 && !submitting;

          async function handleSubmit() {
            if (!canSubmit) return;

            setSubmitting(true);

            const reflection = {
              schema: "arcanum.hope.reflection.g1",
              content: {
                text: text.trim(),
                language: "en",
              },
              created_at: new Date().toISOString(),
              context: {
                entry: "hope-reflection",
              },
            };

            try {
              const cid = await submitReflectionToIPFS(reflection);

              setWitnesses((prev) => [
                ...prev,
                {
                  cid,
                  createdAt: new Date().toISOString(),
                },
              ]);
            } catch (err) {
              console.error("Reflection submission failed", err);
            } finally {
              setText("");
              setSubmitting(false);
            }
          }

          return (
            <section className="space-y-6">
              <div className="space-y-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Leave a reflection…"
                  className="min-h-[120px] w-full resize-none rounded-md border border-neutral-800 bg-transparent p-3 text-sm focus:outline-none focus:ring-0"
                />

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="text-sm text-neutral-300 disabled:opacity-40"
                  >
                    Leave reflection
                  </button>

                  {submitting && (
                    <span className="text-xs text-neutral-500">Submitting…</span>
                  )}
                </div>
              </div>

              {witnesses.length > 0 && (
                <section className="space-y-3 border-t border-white/10 pt-4">
                  <div className="text-xs uppercase tracking-wide text-neutral-500">
                    Witness
                  </div>

                  <ul className="space-y-2 text-sm text-neutral-400">
                    {witnesses.slice(-20).map((witness, index) => (
                      <li key={`${witness.cid}-${index}`} className="italic">
                        A reflection was left.
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </section>
          );
        }
    """),

    "apps/web/src/app/(app)/hope/presence/page.tsx": textwrap.dedent("""\
        'use client';

        import Link from 'next/link';
        import AppStage from '@/components/ui/AppStage';
        import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import TabDots from '@/components/ui/TabDots';
        import CTAActivate from '@/components/shared/CTAActivate';

        const ORDER = ['/hope/presence', '/hope/reflection', '/hope/attunement'] as const;

        export default function HopePresencePage() {
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

                <PanelShell title="Hope — Presence" flush className="min-h-0 flex-1">
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
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),

    "apps/web/src/app/(app)/hope/reflection/page.tsx": textwrap.dedent("""\
        'use client';

        import { useState } from 'react';
        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import { LockHint } from '@/components/shared/LockHint';
        import CTAActivate from '@/components/shared/CTAActivate';
        import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
        import AppStage from '@/components/ui/AppStage';
        import { ReflectionEditor } from '../_components/ReflectionEditor';

        const ORDER = ['/hope/presence', '/hope/reflection', '/hope/attunement'] as const;

        export default function HopeReflectionPage() {
          const [chatTab, setChatTab] = useState<'new' | 'logs'>('new');

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

                <PanelShell title="Hope — Reflection" flush className="flex-1">
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
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),

    "apps/web/src/app/(app)/hope/attunement/page.tsx": textwrap.dedent("""\
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
    """),
}


def backup(path: Path):
    if not path.exists():
        return None
    backup_path = path.with_suffix(path.suffix + ".pre-hope-content-refactor.bak")
    shutil.copy2(path, backup_path)
    return backup_path


def main() -> int:
    for path_str, content in FILES.items():
        path = Path(path_str)
        path.parent.mkdir(parents=True, exist_ok=True)
        bak = backup(path)
        path.write_text(content, encoding="utf-8")
        print(f"patched: {path}")
        if bak:
            print(f"backup:  {bak}")

    print()
    print("what this pass changes:")
    print("  - moves reflection authoring into the Reflection route")
    print("  - makes Presence a calm orientation surface instead of an editor page")
    print("  - moves hope IPFS/editor helpers into shared Hope folders")
    print("  - softens Attunement into preference language")
    print()
    print("next:")
    print("  pnpm -C apps/web typecheck")
    print("  pnpm -C apps/web build")
    print("  bash scripts/repo-index.sh")
    print("  bash scripts/verify-sync.sh")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
