import type { ReactNode } from "react";
import Providers from "./providers";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      {/* Keep this minimal so it doesn't force any particular UI shell */}
      {children}
    </Providers>
  );
}
