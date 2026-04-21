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
