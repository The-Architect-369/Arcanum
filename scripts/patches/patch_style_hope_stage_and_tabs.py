#!/usr/bin/env python3

from pathlib import Path
import shutil
import textwrap

FILES = {
    "apps/web/src/app/(app)/hope/_components/HopeTabRail.tsx": textwrap.dedent("""\
        'use client';

        import { usePathname, useRouter } from 'next/navigation';
        import { cn } from '@/lib/cn';

        type HopeTab = {
          href: string;
          label: string;
        };

        export default function HopeTabRail({ tabs }: { tabs: readonly HopeTab[] }) {
          const pathname = usePathname();
          const router = useRouter();

          return (
            <div className="px-3 pb-3 pt-2">
              <div className="mx-auto flex w-full max-w-4xl justify-start">
                <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur-sm">
                  {tabs.map((tab) => {
                    const active = pathname === tab.href;
                    return (
                      <button
                        key={tab.href}
                        type="button"
                        onClick={() => router.replace(tab.href)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'rounded-xl border px-3 py-2 text-xs uppercase tracking-wide transition-all',
                          active
                            ? 'border-amber-400 bg-blue-700 text-amber-300 shadow-[0_0_12px_rgba(246,196,83,0.35)]'
                            : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10'
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }
    """),

    "apps/web/src/app/(app)/hope/presence/page.tsx": textwrap.dedent("""\
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
    """),

    "apps/web/src/app/(app)/hope/reflection/page.tsx": textwrap.dedent("""\
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
                  <HopeTabRail tabs={TABS} />

                  <PanelShell
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
    """),

    "apps/web/src/app/(app)/hope/attunement/page.tsx": textwrap.dedent("""\
        'use client';

        import { useState } from 'react';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import { LockHint } from '@/components/shared/LockHint';
        import CTAActivate from '@/components/shared/CTAActivate';
        import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
        import AppStage from '@/components/ui/AppStage';
        import HopeTabRail from '../_components/HopeTabRail';

        const ORDER = ['/hope/presence', '/hope/reflection', '/hope/attunement'] as const;
        const TABS = [
          { href: ORDER[0], label: 'Presence' },
          { href: ORDER[1], label: 'Reflection' },
          { href: ORDER[2], label: 'Attunement' },
        ] as const;
        const PRESETS = ['quiet', 'steady', 'warm', 'deep'] as const;

        export default function HopeAttunementPage() {
          const [tone, setTone] = useState('#9bb8ff');
          const [presence, setPresence] = useState(35);
          const [frequency, setFrequency] = useState(30);
          const [depth, setDepth] = useState(45);
          const [preset, setPreset] = useState<(typeof PRESETS)[number]>('quiet');

          return (
            <SwipeRoutes order={ORDER}>
              <AppStage className="items-center">
                <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col">
                  <HopeTabRail tabs={TABS} />

                  <PanelShell
                    title="Hope — Attunement"
                    flush
                    className="min-h-0 flex-1 max-w-4xl"
                    contentClassName="h-full"
                  >
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
                </div>
              </AppStage>
            </SwipeRoutes>
          );
        }
    """),
}


def backup(path: Path):
    if not path.exists():
        return None
    backup_path = path.with_suffix(path.suffix + ".pre-hope-style-pass.bak")
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
    print("  - replaces anonymous hope dots with a labeled HopeTabRail")
    print("  - centers Hope inside a narrower max-w-4xl stage")
    print("  - keeps the card bounded while preserving current route structure")
    print()
    print("next:")
    print("  pnpm -C apps/web typecheck")
    print("  pnpm -C apps/web build")
    print("  bash scripts/repo-index.sh")
    print("  bash scripts/verify-sync.sh")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
