import { ReflectionEditor } from "./ReflectionEditor";

export default function HopePresencePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-10">
      {/* ─────────────────────────────────────────────
          Region A — Orientation (minimal, optional)
         ───────────────────────────────────────────── */}
      <section className="text-sm text-neutral-500">
        <p>You may leave a reflection, or simply be here.</p>
      </section>

      {/* ─────────────────────────────────────────────
          Region B — Reflection Editor (client-side)
         ───────────────────────────────────────────── */}
      <ReflectionEditor />

      {/* ─────────────────────────────────────────────
          Region C — Witness Window (stub)
         ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="text-xs uppercase tracking-wide text-neutral-600">
          Witness
        </div>

        <div className="text-sm text-neutral-500 italic">
          Nothing has been left here yet.
        </div>
      </section>
    </main>
  );
}
