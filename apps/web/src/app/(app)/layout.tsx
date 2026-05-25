import type { ReactNode } from "react";
import Providers from "./providers";
import AppHeader from "@/components/ui/AppHeader";
import AppFooter from "@/components/ui/AppFooter";
import ModuleDeckReveal from "@/components/ui/ModuleDeckReveal";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="arcanum-app-shell relative min-h-dvh overflow-x-clip text-white">
        <AppHeader />

        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
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
        <ModuleDeckReveal />
      </div>
    </Providers>
  );
}
