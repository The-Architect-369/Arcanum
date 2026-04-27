#!/usr/bin/env python3

from pathlib import Path
import shutil
import textwrap

FILES = {
    "apps/web/src/components/ui/AppFooter.tsx": textwrap.dedent("""\
        'use client';

        import { usePathname, useRouter } from 'next/navigation';
        import { BookMarked, Wallet, Globe, Clock, UserRound } from 'lucide-react';
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
          { label: 'Wallet', href: '/wallet', icon: <Wallet size={22} />, badge: 'dot' },
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

    "apps/web/src/app/(app)/wallet/page.tsx": textwrap.dedent("""\
        'use client';

        import AppStage from '@/components/ui/AppStage';
        import PanelShell, { PanelSection } from '@/components/ui/PanelShell';

        export default function WalletPage() {
          return (
            <AppStage>
              <PanelShell title="Wallet" flush className="min-h-0 flex-1">
                <div className="space-y-4">
                  <p className="text-sm text-zinc-300">
                    Wallet is a canonical app surface for custody, balances, receipts, and future vault flows.
                    It is an interface layer, not a source of truth.
                  </p>

                  <PanelSection title="Current State">
                    <div className="space-y-2 text-sm text-zinc-300">
                      <p>Read-only wallet surface for now.</p>
                      <p>Chain truth remains external to this page until the wallet + chain MVP are fully wired.</p>
                    </div>
                  </PanelSection>

                  <PanelSection title="Planned Surface">
                    <div className="space-y-2 text-sm text-zinc-300">
                      <p>• balances, receipts, and transaction review</p>
                      <p>• identity-linked custody surfaces</p>
                      <p>• future vault / safe flows for user-owned records and proofs</p>
                    </div>
                  </PanelSection>

                  <PanelSection title="Transition Note">
                    <div className="space-y-2 text-sm text-zinc-300">
                      <p>
                        Messaging and group surfaces remain temporarily available under <code>/text</code> while
                        Nexus absorbs those flows more cleanly in a later pass.
                      </p>
                    </div>
                  </PanelSection>
                </div>
              </PanelShell>
            </AppStage>
          );
        }
    """),

    "apps/web/src/app/(app)/text/page.tsx": textwrap.dedent("""\
        import { redirect } from 'next/navigation';

        export default function TextIndex() {
          redirect('/text/messages');
        }
    """),
}


def backup(path: Path):
    if not path.exists():
        return None
    backup_path = path.with_suffix(path.suffix + ".pre-rebase-global-nav-to-canon.bak")
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
    print("  - rebases the global footer to Hope / Tempus / Nexus / Wallet / Vitae")
    print("  - removes Text from the top-level app rail without deleting Text routes")
    print("  - gives Wallet a real in-shell canonical stub")
    print("  - keeps /text alive temporarily during Nexus fold-in")
    print()
    print("next:")
    print("  pnpm -C apps/web typecheck")
    print("  pnpm -C apps/web build")
    print("  bash scripts/repo-index.sh")
    print("  bash scripts/verify-sync.sh")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
