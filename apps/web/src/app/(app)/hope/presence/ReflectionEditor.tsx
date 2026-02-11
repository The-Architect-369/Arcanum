"use client";

import { useState } from "react";
import { submitReflectionToIPFS } from "./ipfs";

type Witness = {
  cid: string;
  createdAt: string;
};

export function ReflectionEditor() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);

  const canSubmit = text.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);

    const reflection = {
      schema: "arcanum.hope.reflection.g1",
      content: {
        text: text.trim(),
        language: "en",
      },
      created_at: new Date().toISOString(),
      context: {
        entry: "unknown",
      },
    };

    try {
      const cid = await submitReflectionToIPFS(reflection);

      // Append to witness window (chronological, in-memory)
      setWitnesses((prev) => [
        ...prev,
        {
          cid,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      // Silent failure is acceptable in G1
      console.error("Reflection submission failed", err);
    } finally {
      setText("");
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-8">
      {/* ─────────────────────────────────────────────
          Reflection Editor
         ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Leave a reflection…"
          className="w-full min-h-[120px] resize-none rounded-md border border-neutral-800 bg-transparent p-3 text-sm focus:outline-none focus:ring-0"
        />

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
      </div>

      {/* ─────────────────────────────────────────────
          Witness Window (G1 — In-Memory, Read-Only)
         ───────────────────────────────────────────── */}
      {witnesses.length > 0 && (
        <section className="space-y-3 pt-6">
          <div className="text-xs uppercase tracking-wide text-neutral-600">
            Witness
          </div>

          <ul className="space-y-2 text-sm text-neutral-400">
            {witnesses.slice(-20).map((witness, index) => (
              <li key={`${witness.cid}-${index}`} className="italic">
                A reflection was left.
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
