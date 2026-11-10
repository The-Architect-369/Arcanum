import type { Metadata } from "next";
import ArchitectGate from "@/components/architect/ArchitectGate";
import "../architect.css";
export const metadata: Metadata = {
  title: "Architect access unavailable",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default function Denied() {
  return (
    <ArchitectGate title="Architect access is not available.">
      <p>
        This account or address is not enrolled for these records. Signing in, a
        matching domain, or a title does not confer access or action rights.
      </p>
      <p>
        <a href="/architect/login">Return to Architect sign-in →</a>
      </p>
    </ArchitectGate>
  );
}
