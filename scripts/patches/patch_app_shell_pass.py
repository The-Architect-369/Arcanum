#!/usr/bin/env python3

from pathlib import Path
import shutil
import sys
import textwrap

FILES = {
    "apps/web/src/app/(app)/layout.tsx": textwrap.dedent("""\
        import type { ReactNode } from "react";
        import Providers from "./providers";
        import AppHeader from "@/components/ui/AppHeader";
        import AppFooter from "@/components/ui/AppFooter";

        export default function AppLayout({ children }: { children: ReactNode }) {
          return (
            <Providers>
              <div className="min-h-dvh overflow-x-clip bg-black text-white">
                <AppHeader />

                <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
                  <main
                    className="
                      flex-1
                      px-0
                      pt-[calc(3.5rem+env(safe-area-inset-top))]
                      pb-[calc(3.5rem+env(safe-area-inset-bottom))]
                    "
                  >
                    {children}
                  </main>
                </div>

                <AppFooter />
              </div>
            </Providers>
          );
        }
    """),
    "apps/web/src/app/(app)/app/page.tsx": textwrap.dedent("""\
        "use client";

        import { useEffect } from "react";
        import { useRouter } from "next/navigation";

        export default function AppEntryPage() {
          const router = useRouter();

          useEffect(() => {
            const initialized = window.localStorage.getItem("ARCANUM_NODE_INITIALIZED");
            const nextPath = initialized ? "/hope" : "/activate";
            router.replace(nextPath);
          }, [router]);

          return null;
        }
    """),
    "apps/web/src/components/ui/AppHeader.tsx": textwrap.dedent("""\
        'use client';

        import { useState } from 'react';
        import { Gem, Menu, UserCog, Wallet, ArrowLeftRight, Settings, Bell } from 'lucide-react';
        import { useRouter } from 'next/navigation';
        import BadgeCounter from '@/components/ui/BadgeCounter';
        import ACCOnboardingModal from '@/components/ui/ACCOnboardingModal';
        import { useAccount } from '@/state/useAccount';

        export default function AppHeader() {
          const router = useRouter();
          const [open, setOpen] = useState(false);

          const acc = useAccount();
          const mana = acc.mana;
          const notifCount = acc.notifCount;

          const go = (path: string) => {
            setOpen(false);
            router.push(path);
          };

          return (
            <>
              <header
                className="fixed inset-x-0 top-0 z-50 border-b border-zinc-800 bg-black/60 pt-[env(safe-area-inset-top)] backdrop-blur-md"
                role="banner"
              >
                <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-3">
                  <div className="flex select-none items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-b from-zinc-300 to-zinc-100/70" />
                    <span className="sr-only">The Arcanum</span>
                  </div>

                  <div className="flex-1" />

                  <button
                    onClick={() => go('/wallet')}
                    className="flex items-center gap-1.5 text-amber-300 transition-colors hover:text-amber-200"
                    aria-label="Open Wallet"
                  >
                    <span className="text-sm font-semibold tabular-nums">{mana.toLocaleString()}</span>
                    <Gem size={18} aria-hidden="true" />
                  </button>

                  <BadgeCounter count={notifCount} max={9}>
                    <button
                      onClick={() => go('/notifications')}
                      className="rounded-md p-2 hover:bg-white/5 active:bg-white/10"
                      aria-label="Notifications"
                      title="Notifications"
                    >
                      <Bell size={20} />
                    </button>
                  </BadgeCounter>

                  <button
                    onClick={() => setOpen((v) => !v)}
                    className="rounded-md p-2 hover:bg-white/5 active:bg-white/10"
                    aria-expanded={open}
                    aria-label="Open Menu"
                  >
                    <Menu size={20} />
                  </button>
                </div>
              </header>

              {open && (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                  <button
                    className="absolute inset-0 bg-black/60"
                    aria-label="Close Menu"
                    onClick={() => setOpen(false)}
                  />
                  <aside className="absolute right-0 top-14 bottom-0 w-80 max-w-[88vw] border-l border-zinc-800 bg-black/90 shadow-2xl backdrop-blur-md">
                    <nav className="space-y-1 p-3">
                      <DrawerItem icon={<UserCog size={18} />} label="Account" onClick={() => go('/account')} />
                      <DrawerItem icon={<Wallet size={18} />} label="Wallet" onClick={() => go('/wallet')} />
                      <DrawerItem icon={<ArrowLeftRight size={18} />} label="Exchange" onClick={() => go('/exchange')} />
                      <DrawerItem icon={<Bell size={18} />} label="Notifications" onClick={() => go('/notifications')} />
                      <DrawerItem icon={<Settings size={18} />} label="Preferences" onClick={() => go('/preferences')} />
                    </nav>
                  </aside>
                </div>
              )}

              <ACCOnboardingModal />
            </>
          );
        }

        function DrawerItem({
          icon,
          label,
          onClick,
        }: {
          icon: React.ReactNode;
          label: string;
          onClick: () => void;
        }) {
          return (
            <button
              onClick={onClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 active:bg-white/10"
            >
              <span className="shrink-0 text-zinc-200">{icon}</span>
              <span className="text-sm text-zinc-100">{label}</span>
              <span className="ml-auto h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
            </button>
          );
        }
    """),
    "apps/web/src/components/ui/AppFooter.tsx": textwrap.dedent("""\
        'use client';

        import { usePathname, useRouter } from 'next/navigation';
        import { BookMarked, MessageSquareMore, Globe, Clock, UserRound } from 'lucide-react';
        import { cn } from '@/lib/cn';

        type Tab = {
          label: string;
          href: string;
          icon: React.ReactNode;
          badge?: 'dot' | 'count';
          count?: number;
        };

        const TABS: Tab[] = [
          { label: 'Hope', href: '/hope', icon: <UserRound size={22} />, badge: 'dot' },
          { label: 'Tempus', href: '/tempus', icon: <Clock size={22} />, badge: 'dot' },
          { label: 'Nexus', href: '/nexus', icon: <Globe size={22} />, badge: 'dot' },
          { label: 'Text', href: '/text', icon: <MessageSquareMore size={22} />, badge: 'count', count: 0 },
          { label: 'Vitae', href: '/vitae', icon: <BookMarked size={22} />, badge: 'dot' },
        ];

        export default function AppFooter() {
          const pathname = usePathname();
          const router = useRouter();

          const isActive = (href: string) =>
            pathname === href || pathname.startsWith(href + '/');

          return (
            <nav
              className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-black/70 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
              role="navigation"
              aria-label="Main"
            >
              <div className="mx-auto grid max-w-5xl grid-cols-5">
                {TABS.map((t) => {
                  const active = isActive(t.href);
                  return (
                    <button
                      key={t.href}
                      onClick={() => router.push(t.href)}
                      className={cn(
                        'relative grid h-14 w-full place-items-center rounded-xl transition-colors',
                        active
                          ? 'tile-3d-active text-amber-300 shadow-[0_0_10px_rgba(246,196,83,0.6)]'
                          : 'text-zinc-400 hover:bg-white/5 active:bg-white/10'
                      )}
                      aria-current={active ? 'page' : undefined}
                      aria-label={t.label}
                      title={t.label}
                    >
                      <span className="grid place-items-center">{t.icon}</span>
                      {renderBadge(t)}
                    </button>
                  );
                })}
              </div>
            </nav>
          );
        }

        function renderBadge(t: Tab) {
          if (t.badge === 'dot') {
            return (
              <span
                className="absolute right-4 top-2 h-2 w-2 rounded-full bg-amber-400"
                aria-hidden="true"
              />
            );
          }

          if (t.badge === 'count' && (t.count ?? 0) > 0) {
            const n = t.count!;
            return (
              <span className="absolute right-3 top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-amber-400 px-1 text-[11px] font-semibold text-black">
                {n > 99 ? '99+' : n}
              </span>
            );
          }

          return null;
        }
    """),
}


def backup(path: Path):
    if not path.exists():
        return None
    backup_path = path.with_suffix(path.suffix + ".pre-app-shell-pass.bak")
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
    print("  - mounts AppHeader in the (app) shell")
    print("  - mounts AppFooter tab rail in the (app) shell")
    print("  - adds safe-area-aware top/bottom app stage padding")
    print("  - turns /app into a real entry redirect")
    print()
    print("next:")
    print("  pnpm -C apps/web typecheck")
    print("  pnpm -C apps/web build")
    print("  bash scripts/repo-index.sh")
    print("  bash scripts/verify-sync.sh")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
