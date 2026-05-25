import type { ReactNode } from "react";
import Providers from "./providers";
import AppHeader from "@/components/ui/AppHeader";
import AppFooter from "@/components/ui/AppFooter";
import ModuleDeckReveal from "@/components/ui/ModuleDeckReveal";
import ConstellationField from "@/components/ui/ConstellationField";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="arcanum-app-shell relative min-h-[100svh] overflow-hidden text-white">
        <ConstellationField />
        <AppHeader />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-5xl flex-col">
          <main className="arcanum-app-main flex-1 px-0">
            {children}
          </main>
        </div>

        <AppFooter />
        <ModuleDeckReveal />
      </div>
    </Providers>
  );
}
