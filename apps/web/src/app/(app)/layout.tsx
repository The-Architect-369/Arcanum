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
