#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import shutil
import sys
import textwrap

FILES = {
    "apps/web/src/app/(marketing)/client-layout.tsx": textwrap.dedent("""\
        "use client";

        import { ReactNode } from "react";
        import ConstellationCanvas from "@/components/ui/ConstellationCanvas";
        import Header from "@/components/ui/Header";
        import PanelShell from "@/components/ui/PanelShell";

        export default function ClientLayout({ children }: { children: ReactNode }) {
          return (
            <>
              <ConstellationCanvas />
              <div className="relative min-h-screen">
                <Header />
                <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-6xl flex-col px-3 pb-4 pt-3 sm:px-4">
                  <PanelShell
                    className="flex-1"
                    flush
                    noPadding
                    contentClassName="overflow-y-auto p-0"
                  >
                    {children}
                  </PanelShell>

                  <footer className="px-2 pb-[max(env(safe-area-inset-bottom),0px)] pt-3 text-center text-xs text-white/70">
                    © {new Date().getFullYear()} Arcanum · Presence before mechanics.
                  </footer>
                </div>
              </div>
            </>
          );
        }
    """),
    "apps/web/src/app/(marketing)/page.tsx": textwrap.dedent("""\
        'use client';

        import ActiveSectionObserver from '@/components/ui/ActiveSectionObserver';
        import HeroBento from '@/components/ui/HeroBento';
        import BentoShowcase from '@/components/ui/BentoShowcase';
        import ActivateBento from '@/components/ui/ActivateBento';

        export default function HomePage() {
          return (
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-3 sm:p-4" id="top">
              <ActiveSectionObserver />

              <section id="hero" aria-labelledby="hero-heading">
                <HeroBento />
              </section>

              <section aria-labelledby="arcnet-heading">
                <BentoShowcase
                  variant="arcnet"
                  className="min-h-[420px] sm:min-h-[520px] md:min-h-[620px]"
                />
              </section>

              <section aria-labelledby="mana-heading">
                <BentoShowcase
                  variant="mana"
                  className="min-h-[420px] sm:min-h-[520px] md:min-h-[620px]"
                />
              </section>

              <section aria-labelledby="tempus-heading">
                <BentoShowcase
                  variant="tempus"
                  className="min-h-[420px] sm:min-h-[520px] md:min-h-[620px]"
                />
              </section>

              <section id="activate" aria-labelledby="activate-heading">
                <ActivateBento variant="full" />
              </section>
            </main>
          );
        }
    """),
}


def backup_file(path: Path) -> Path:
    backup = path.with_suffix(path.suffix + ".pre-panelshell-frame.bak")
    shutil.copy2(path, backup)
    return backup


def main() -> int:
    missing = [p for p in FILES if not Path(p).exists()]
    if missing:
      print("error: missing target files:", file=sys.stderr)
      for item in missing:
          print(f"  - {item}", file=sys.stderr)
      return 1

    for path_str, content in FILES.items():
        path = Path(path_str)
        backup = backup_file(path)
        path.write_text(content, encoding="utf-8")
        print(f"patched: {path}")
        print(f"backup:  {backup}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())