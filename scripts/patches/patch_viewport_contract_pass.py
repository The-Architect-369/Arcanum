#!/usr/bin/env python3

from pathlib import Path
import shutil
import sys
import textwrap

FILES = {
    "apps/web/src/components/ui/AppStage.tsx": textwrap.dedent("""\
        import * as React from "react";
        import { cn } from "@/lib/cn";

        export default function AppStage({
          children,
          className,
        }: {
          children: React.ReactNode;
          className?: string;
        }) {
          return <div className={cn("flex min-h-full flex-col", className)}>{children}</div>;
        }
    """),
    "apps/web/src/app/(app)/hope/character/page.tsx": textwrap.dedent("""\
        'use client';

        import { useState } from 'react';
        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import { LockHint } from '@/components/shared/LockHint';
        import CTAActivate from '@/components/shared/CTAActivate';
        import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
        import AppStage from '@/components/ui/AppStage';

        const ORDER = ['/hope/inventory', '/hope/character', '/hope/stylize'] as const;

        export default function HopeCharacterPage() {
          const [chatTab, setChatTab] = useState<'new' | 'logs'>('new');

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

                <PanelShell title="Hope — Character" flush className="flex-1">
                  <div className="grid h-full grid-rows-[auto_1fr] gap-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="w-full">
                        <div className="aspect-square rounded-xl border border-white/10 bg-white/[0.03]" />
                      </div>

                      <div className="flex flex-col gap-3">
                        <p className="text-sm text-zinc-300">
                          Welcome, human. Explore freely as a guest. When you’re ready, we’ll set up your ACC and wallet together.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <CTAActivate />
                          <button className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
                            What can I do as a guest?
                          </button>
                        </div>
                      </div>
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
                          <PanelSection title="Start a conversation" className="flex min-h-0 flex-1 flex-col">
                            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400">
                              <div className="opacity-70">Your conversation with Hope will appear here.</div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <input
                                placeholder="Ask Hope anything…"
                                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none"
                              />
                              <button className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">Send</button>
                            </div>
                          </PanelSection>
                        </div>
                      ) : (
                        <PanelSection title="Chat Logs" className="min-h-0 flex-1">
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
    "apps/web/src/app/(app)/hope/inventory/page.tsx": textwrap.dedent("""\
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
    """),
    "apps/web/src/app/(app)/hope/stylize/page.tsx": textwrap.dedent("""\
        'use client';

        import { useState } from 'react';
        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import { LockHint } from '@/components/shared/LockHint';
        import CTAActivate from '@/components/shared/CTAActivate';
        import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
        import AppStage from '@/components/ui/AppStage';

        const ORDER = ['/hope/inventory', '/hope/character', '/hope/stylize'] as const;
        const MATERIALS = ['wood', 'garnet', 'knitted', 'cotton'] as const;

        export default function HopeStylizePage() {
          const [color, setColor] = useState('#9bb8ff');
          const [height, setHeight] = useState(50);
          const [weight, setWeight] = useState(50);
          const [mat, setMat] = useState<(typeof MATERIALS)[number]>('wood');

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

                <PanelShell title="Hope — Stylize" flush className="flex-1">
                  <div className="grid h-full grid-rows-[auto_1fr] gap-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div
                        className="grid aspect-square place-items-center rounded-xl border border-white/10"
                        style={{ background: color }}
                      >
                        <div className="text-xs uppercase tracking-wide text-black/70">
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

                    <div className="min-h-0 flex flex-col">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {MATERIALS.map((m) => (
                          <button
                            key={m}
                            onClick={() => setMat(m)}
                            className={`rounded-md border px-3 py-1.5 text-xs uppercase ${
                              mat === m
                                ? 'border-amber-400 bg-blue-700 text-amber-300'
                                : 'border-zinc-600 bg-neutral-900/60 text-zinc-300 hover:bg-white/5'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>

                      <PanelSection title="Preview Slots" className="min-h-0 flex-1">
                        <div className="grid h-full grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4 md:grid-cols-6">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div
                              key={i}
                              className="grid aspect-square place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-xs text-white/60"
                            >
                              Empty
                            </div>
                          ))}
                        </div>
                      </PanelSection>
                    </div>
                  </div>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),
    "apps/web/src/app/(app)/tempus/calendar/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import PanelShell from '@/components/ui/PanelShell';
        import AppStage from '@/components/ui/AppStage';
        import { computeWindowState } from '@/lib/tempus/window';

        const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calendar'] as const;

        function labelPhase(phase: 'open' | 'rest' | 'silent') {
          return phase === 'open' ? 'Open' : phase === 'rest' ? 'Resting' : 'Silent';
        }

        export default function TempusCalendarPage() {
          const now = new Date();

          const blocks = [0, 6, 12, 18].map((h) => {
            const d = new Date(now.getTime() + h * 3600_000);
            const w = computeWindowState(d);
            return {
              when: d,
              phase: w.phase,
              label: `${w.planetaryDay} ${w.isDay ? 'Day' : 'Night'}`,
              zodiac: `${w.zodiacSign} ${w.zodiacDay}`,
              lunar: w.lunarPhase,
            };
          });

          return (
            <SwipeRoutes order={ORDER}>
              <AppStage>
                <TabDots
                  tabs={[
                    { href: ORDER[0], aria: 'Codex' },
                    { href: ORDER[1], aria: 'Clock' },
                    { href: ORDER[2], aria: 'Calendar' },
                  ]}
                />

                <PanelShell
                  title={<h1 className="text-lg font-semibold">Tempus — Calendar</h1>}
                  actions={<div className="text-xs text-zinc-400">Next 24h (sampled, non-coercive)</div>}
                  flush
                  className="flex-1"
                >
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-300">
                      A gentle view of windows. No deadlines. No penalties. Participation is optional.
                    </p>

                    <div className="grid gap-3">
                      {blocks.map((b, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-zinc-100">{b.label}</div>
                            <div className="text-xs text-zinc-300">{labelPhase(b.phase)}</div>
                          </div>
                          <div className="mt-1 text-xs text-zinc-400">
                            {b.when.toLocaleString()} · {b.zodiac} · {b.lunar}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-zinc-400">
                      This is an MVP view; we can later add a fuller dial visualization without introducing urgency mechanics.
                    </p>
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
    backup_path = path.with_suffix(path.suffix + ".pre-viewport-contract-pass.bak")
    shutil.copy2(path, backup_path)
    return backup_path


def main() -> int:
    backups = []

    for path_str, content in FILES.items():
        path = Path(path_str)
        path.parent.mkdir(parents=True, exist_ok=True)
        bak = backup(path)
        if bak:
            backups.append(bak)
        path.write_text(content, encoding="utf-8")
        print(f"patched: {path}")
        if bak:
            print(f"backup:  {bak}")

    print()
    print("what this pass changes:")
    print("  - adds AppStage as the shared in-shell page wrapper")
    print("  - removes old pre-shell height wrappers from Hope pages")
    print("  - removes double-framing from Tempus Calendar")
    print("  - fixes /tempus/calendar swipe-order typo")
    print()
    print("next:")
    print("  pnpm -C apps/web typecheck")
    print("  pnpm -C apps/web build")
    print("  bash scripts/repo-index.sh")
    print("  bash scripts/verify-sync.sh")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
