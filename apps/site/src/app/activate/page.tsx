export const metadata = { title: "Activate — ARCnet" };

import { copy } from "@/content/narrative";

export default function Activate() {
  return (
    <main className="section">
      <div className="bento-card bento-mobile p-6 md:p-10 space-y-6">
        <div className="bento-ring" />
        <h1 className="h1">Activate</h1>
        <p className="p opacity-80">{copy.activate.pageLead}</p>
        <p className="text-sm opacity-60">{copy.activate.comingSoon}</p>
      </div>
    </main>
  );
}
