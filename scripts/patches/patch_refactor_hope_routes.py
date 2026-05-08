#!/usr/bin/env python3

from pathlib import Path
import shutil
import textwrap

FILES = {
    "apps/web/src/app/(app)/hope/page.tsx": textwrap.dedent("""\
        import { redirect } from 'next/navigation';

        export default function HopeIndex() {
          redirect('/hope/presence');
        }
    """),

    "apps/web/src/app/(app)/hope/presence/page.tsx": textwrap.dedent("""\
        'use client';

        import AppStage from '@/components/ui/AppStage';
        import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import TabDots from '@/components/ui/TabDots';
        import { ReflectionEditor } from './ReflectionEditor';

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
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-300">
                      Hope is here as a subtle presence. You may reflect, remain silent, or continue onward.
                    </p>

                    <PanelSection title="Orientation">
                      <p className="text-sm text-zinc-300">
                        Presence is the quiet threshold of Hope. No urgency. No demand. No pressure to perform.
                      </p>
                    </PanelSection>

                    <PanelSection title="Leave a Reflection">
                      <ReflectionEditor />
                    </PanelSection>

                    <PanelSection title="Witness">
                      <p className="text-sm italic text-zinc-400">
                        Nothing has been left here yet.
                      </p>
                    </PanelSection>
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
                  <div className="grid h-full grid-rows-[auto_1fr] gap-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="w-full">
                        <div className="aspect-square rounded-xl border border-white/10 bg-white/[0.03]" />
                      </div>

                      <div className="flex flex-col gap-3">
                        <p className="text-sm text-zinc-300">
                          Reflection is user-initiated. Hope may respond, clarify, and mirror what you have chosen to bring forward.
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
        const MATERIALS = ['wood', 'garnet', 'knitted', 'cotton'] as const;

        export default function HopeAttunementPage() {
          const [color, setColor] = useState('#9bb8ff');
          const [height, setHeight] = useState(50);
          const [weight, setWeight] = useState(50);
          const [mat, setMat] = useState<(typeof MATERIALS)[number]>('wood');

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
                        <PanelSection title="Presence Tone">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-9 w-16 rounded-md border border-white/15 bg-white/10"
                          />
                        </PanelSection>
                        <PanelSection title="Presence Intensity">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full"
                          />
                        </PanelSection>
                        <PanelSection title="Reflection Weight">
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

                      <PanelSection title="Attunement Presets" className="min-h-0 flex-1">
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

    "apps/web/src/app/(app)/hope/character/page.tsx": textwrap.dedent("""\
        import { redirect } from 'next/navigation';

        export default function HopeCharacterRedirect() {
          redirect('/hope/reflection');
        }
    """),

    "apps/web/src/app/(app)/hope/inventory/page.tsx": textwrap.dedent("""\
        import { redirect } from 'next/navigation';

        export default function HopeInventoryRedirect() {
          redirect('/hope/reflection');
        }
    """),

    "apps/web/src/app/(app)/hope/stylize/page.tsx": textwrap.dedent("""\
        import { redirect } from 'next/navigation';

        export default function HopeStylizeRedirect() {
          redirect('/hope/attunement');
        }
    """),
}


def backup(path: Path):
    if not path.exists():
        return None
    backup_path = path.with_suffix(path.suffix + ".pre-hope-routes-refactor.bak")
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
    print("  - rebases /hope to /hope/presence")
    print("  - creates canonical /hope/reflection and /hope/attunement routes")
    print("  - preserves old Hope URLs as redirects")
    print("  - keeps the actual content migration modest for the first commit")
    print()
    print("next:")
    print("  pnpm -C apps/web typecheck")
    print("  pnpm -C apps/web build")
    print("  bash scripts/repo-index.sh")
    print("  bash scripts/verify-sync.sh")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
