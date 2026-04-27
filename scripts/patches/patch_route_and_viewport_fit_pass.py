#!/usr/bin/env python3

from pathlib import Path
import shutil
import textwrap

FILES = {
    "apps/web/src/components/ui/AppStage.tsx": textwrap.dedent("""\
        import * as React from "react";
        import { cn } from "@/lib/cn";

        const STAGE_STYLE: React.CSSProperties = {
          height: "calc(100dvh - 7rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
          minHeight: "calc(100dvh - 7rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
        };

        export default function AppStage({
          children,
          className,
        }: {
          children: React.ReactNode;
          className?: string;
        }) {
          return (
            <div
              style={STAGE_STYLE}
              className={cn("flex min-h-0 flex-col overflow-hidden", className)}
            >
              {children}
            </div>
          );
        }
    """),

    "apps/web/src/components/ui/PanelShell.tsx": textwrap.dedent("""\
        'use client';

        import * as React from 'react';
        import { cn } from "@/lib/cn";

        type PanelShellProps = {
          title?: React.ReactNode;
          actions?: React.ReactNode;
          contentClassName?: string;
          className?: string;
          flush?: boolean;
          noPadding?: boolean;
          children: React.ReactNode;
        };

        export default function PanelShell({
          title,
          actions,
          contentClassName,
          className,
          flush = false,
          noPadding = false,
          children,
        }: PanelShellProps) {
          return (
            <div
              className={cn(
                flush ? 'px-0 my-0' : 'px-3 my-4',
                'mx-auto max-w-5xl min-h-0',
                className
              )}
            >
              <div className="relative h-full min-h-0 rounded-3xl bg-[linear-gradient(135deg,rgba(80,130,255,.45),rgba(246,196,83,.35))] p-[1px] shadow-[0_0_30px_rgba(120,180,255,0.15)]">
                <div
                  className={cn(
                    'tile-3d',
                    'flex h-full min-h-0 flex-col',
                    'rounded-[calc(theme(borderRadius.3xl)-1px)] border border-white/7.5',
                    'bg-[rgba(10,10,16,0.85)] backdrop-blur-md',
                    'shadow-[0_12px_40px_rgba(0,0,0,0.55),inset_0_0_40px_rgba(40,80,160,0.08)]'
                  )}
                >
                  {(title || actions) && (
                    <div
                      className={cn(
                        'shrink-0 flex items-center gap-3 border-b border-white/10',
                        noPadding ? 'px-0 py-0' : 'px-4 sm:px-6 py-3'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        {typeof title === 'string' ? (
                          <h2 className="truncate text-base font-semibold text-zinc-100 sm:text-lg">
                            {title}
                          </h2>
                        ) : (
                          title
                        )}
                      </div>
                      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
                    </div>
                  )}

                  <div
                    className={cn(
                      'min-h-0 flex-1 overflow-y-auto scrollbar-none',
                      noPadding ? '' : 'p-4 sm:p-6',
                      contentClassName
                    )}
                  >
                    {children}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        export function PanelSection({
          title,
          children,
          className,
        }: {
          title?: React.ReactNode;
          children: React.ReactNode;
          className?: string;
        }) {
          return (
            <section className={cn('mb-6 last:mb-0', className)}>
              {title && <div className="mb-2 text-sm font-semibold tracking-wide text-zinc-300">{title}</div>}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                {children}
              </div>
            </section>
          );
        }
    """),

    "apps/web/src/app/(app)/tempus/codex/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import PanelShell from '@/components/ui/PanelShell';
        import AppStage from '@/components/ui/AppStage';
        import { useTempusWindow } from '@/hooks/useTempusWindow';

        const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calendar'] as const;

        export default function TempusCodexPage() {
          const w = useTempusWindow();

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
                  title={<h1 className="text-lg font-semibold">Tempus — Codex</h1>}
                  actions={<div className="text-xs text-zinc-400">Hybrid MVP (tables now, engine later)</div>}
                  flush
                  className="min-h-0 flex-1"
                >
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-300">
                      Correspondences for planetary, lunar, and zodiac cycles. This phase is informational and non-coercive.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Card label="Zodiac Month (Cusps)" value={`${w.zodiacSign} · Day ${w.zodiacDay}`} />
                      <Card label="Lunar Phase (8-step)" value={w.lunarPhase} />
                      <Card label="Moon Sign (2.5-day steps)" value={w.moonZodiac} />
                      <Card label="Planetary Day" value={`${w.planetaryDay} (${w.isDay ? 'Day' : 'Night'})`} />
                    </div>

                    <p className="text-xs text-zinc-400">
                      Seam for later: replace cusp + new-moon tables with an ephemeris/astronomy engine (server route or library),
                      while keeping this API stable.
                    </p>
                  </div>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }

        function Card({ label, value }: { label: string; value: string }) {
          return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-zinc-400">{label}</div>
              <div className="mt-1 text-sm text-zinc-100">{value}</div>
            </div>
          );
        }
    """),

    "apps/web/src/app/(app)/tempus/clock/page.tsx": textwrap.dedent("""\
        'use client';

        import TabDots from '@/components/ui/TabDots';
        import SwipeRoutes from '@/components/ui/SwipeRoutes';
        import PanelShell from '@/components/ui/PanelShell';
        import AppStage from '@/components/ui/AppStage';
        import { useTempusWindow } from '@/hooks/useTempusWindow';

        const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calendar'] as const;

        function PhasePill({ phase }: { phase: 'open' | 'rest' | 'silent' }) {
          const text = phase === 'open' ? 'Open' : phase === 'rest' ? 'Resting' : 'Silent';
          return (
            <span className="inline-flex items-center rounded-full border border-white/15 px-2.5 py-1 text-xs text-zinc-100">
              {text}
            </span>
          );
        }

        export default function TempusClockPage() {
          const w = useTempusWindow();

          const headline =
            w.phase === 'open'
              ? 'The window is open.'
              : w.phase === 'rest'
                ? 'The window is resting.'
                : 'The system is silent.';

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
                  title={
                    <div className="flex items-center gap-3">
                      <h1 className="text-lg font-semibold">Tempus — Clock</h1>
                      <PhasePill phase={w.phase} />
                    </div>
                  }
                  actions={<div className="text-xs text-zinc-400">{w.planetaryDay} {w.isDay ? 'Day' : 'Night'}</div>}
                  flush
                  className="min-h-0 flex-1"
                >
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-200">{headline}</p>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Card label="Planetary Day" value={w.planetaryDay} />
                      <Card label="Day / Night" value={w.isDay ? 'Day' : 'Night'} />
                      <Card label="Zodiac Month" value={`${w.zodiacSign} · Day ${w.zodiacDay}`} />
                      <Card label="Lunar Phase" value={w.lunarPhase} />
                      <Card label="Moon Sign (MVP)" value={w.moonZodiac} />
                      <Card label="Window" value={w.phase === 'open' ? 'Open' : w.phase === 'rest' ? 'Resting' : 'Silent'} />
                    </div>

                    <p className="text-xs text-zinc-400">
                      No countdowns. No streaks. Windows are rhythm, not pressure.
                    </p>
                  </div>
                </PanelShell>
              </AppStage>
            </SwipeRoutes>
          );
        }

        function Card({ label, value }: { label: string; value: string }) {
          return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-zinc-400">{label}</div>
              <div className="mt-1 text-sm text-zinc-100">{value}</div>
            </div>
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
                  className="min-h-0 flex-1"
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
    backup_path = path.with_suffix(path.suffix + ".pre-route-viewport-fit-pass.bak")
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
    print("  - fixes Tempus route typo in codex / clock / calendar order arrays")
    print("  - bounds AppStage to the real visible app viewport")
    print("  - hardens PanelShell for internal scrolling with min-h-0")
    print("  - moves Tempus pages onto the bounded stage + flush card pattern")
    print()
    print("next:")
    print("  pnpm -C apps/web typecheck")
    print("  pnpm -C apps/web build")
    print("  bash scripts/repo-index.sh")
    print("  bash scripts/verify-sync.sh")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
