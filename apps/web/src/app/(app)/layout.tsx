import type { ReactNode } from "react";
import Providers from "./providers";
import AppHeader from "@/components/ui/AppHeader";
import AppFooter from "@/components/ui/AppFooter";
import ModuleDeckReveal from "@/components/ui/ModuleDeckReveal";
import ConstellationField from "@/components/ui/ConstellationField";
import ViewportLock from "@/components/ui/ViewportLock";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ViewportLock />
      <div className="arcanum-app-shell relative overflow-hidden text-white">
        <ConstellationField />
        <AppHeader />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col">
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
