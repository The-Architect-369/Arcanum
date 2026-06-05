"use client";

import { useState } from "react";
import { recordHopeReflection } from "@/lib/hope/context";
import { getVitaeState } from "@/lib/mobile/vitae";
import { captureTempusContext } from "@/lib/tempus/context";
import { submitReflectionToIPFS } from "../_lib/ipfs";

type Witness = {
  cid?: string;
  createdAt: string;
  localId?: string;
};

export function ReflectionEditor({ onRecorded }: { onRecorded?: () => void }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [includeTempusContext, setIncludeTempusContext] = useState(true);
  const [includeVitaeSummary, setIncludeVitaeSummary] = useState(false);
  const [alsoWitnessIpfs, setAlsoWitnessIpfs] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);

  const canSubmit = text.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    setMessage(null);

    const trimmed = text.trim();
    const tempusContext = includeTempusContext ? captureTempusContext(new Date(), { depth: "seasonal" }) : undefined;
    const vitaeState = includeVitaeSummary ? await getVitaeState() : undefined;

    try {
      const local = await recordHopeReflection({
        userText: trimmed,
        tempusContext,
        vitaeState,
      });

      let cid: string | undefined;
      if (alsoWitnessIpfs) {
        const reflection = {
          schema: "arcanum.hope.reflection.g1",
          content: {
            text: trimmed,
            language: "en",
          },
          created_at: new Date().toISOString(),
          context: {
            entry: "hope-reflection",
            local_reflection_id: local.ok ? local.reflection.id : undefined,
            tempus_attached: Boolean(tempusContext),
            vitae_summary_attached: Boolean(vitaeState),
            authority: "advisory_only",
            interpretation: null,
          },
        };
        cid = await submitReflectionToIPFS(reflection);
      }

      if (local.ok) {
        setWitnesses((prev) => [
          ...prev,
          {
            cid,
            localId: local.reflection.id,
            createdAt: new Date().toISOString(),
          },
        ]);
        setMessage(
          cid
            ? "Reflection recorded locally and witnessed to IPFS."
            : "Reflection recorded locally as advisory context."
        );
        onRecorded?.();
      } else {
        setMessage(local.message);
      }
    } catch (err) {
      console.error("Reflection submission failed", err);
      setMessage("Reflection could not be recorded.");
    } finally {
      setText("");
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Leave a reflection…"
          className="min-h-[120px] w-full resize-none rounded-md border border-neutral-800 bg-transparent p-3 text-sm focus:outline-none focus:ring-0"
        />

        <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-400">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={includeTempusContext}
              onChange={(event) => setIncludeTempusContext(event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm text-zinc-100">Attach Tempus context</span>
              <span>Factual timing context only. Not guidance, readiness, or command.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={includeVitaeSummary}
              onChange={(event) => setIncludeVitaeSummary(event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm text-zinc-100">Attach Vitae local summary</span>
              <span>Optional local practice summary only. Not recognition or authority.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={alsoWitnessIpfs}
              onChange={(event) => setAlsoWitnessIpfs(event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm text-zinc-100">Also create IPFS witness</span>
              <span>Optional content witness. Local reflection remains private by default.</span>
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="text-sm text-neutral-300 disabled:opacity-40"
          >
            Leave reflection
          </button>

          {submitting && (
            <span className="text-xs text-neutral-500">Submitting…</span>
          )}
        </div>
        {message && <div className="text-xs text-zinc-400">{message}</div>}
      </div>

      {witnesses.length > 0 && (
        <section className="space-y-3 border-t border-white/10 pt-4">
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            Witness
          </div>

          <ul className="space-y-2 text-sm text-neutral-400">
            {witnesses.slice(-20).map((witness, index) => (
              <li key={`${witness.localId || witness.cid}-${index}`} className="italic">
                A reflection was left{witness.cid ? " and witnessed" : " locally"}.
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
