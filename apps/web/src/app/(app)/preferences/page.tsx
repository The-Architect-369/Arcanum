"use client";

import Link from "next/link";
import { useState } from "react";
import usePreference from "@/state/usePreference";
import { clearIPFSRecords, clearReceipts } from "@/lib/mobile/persistence";
import { clearAccountSession } from "@/state/useAccount";

export default function PreferencesPage() {
  const [prefs, update] = usePreference();
  const [message, setMessage] = useState<string | null>(null);

  async function handleClearCaches() {
    await Promise.all([clearIPFSRecords(), clearReceipts()]);
    setMessage("Cleared local content cache and receipt history.");
  }

  async function handleClearSession() {
    await clearAccountSession();
    setMessage("Cleared the stored account session. Identity artifacts remain until removed from Account.");
  }

  return (
    <div className="mx-auto max-w-5xl px-3 py-4">
      <div className="space-y-4">
        <header>
          <h1 className="text-lg font-semibold">Preferences</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Mobile behavior, diagnostics, and local persistence controls.
          </p>
        </header>

        <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <PreferenceRow
            title="Reduced motion"
            description="Set a reduced-motion signal for mobile UI surfaces."
            checked={prefs.reducedMotion}
            onChange={(checked) => update({ reducedMotion: checked })}
          />
          <PreferenceRow
            title="Module reveal overlay"
            description="Keep module transition reveals enabled while navigating."
            checked={prefs.moduleReveal}
            onChange={(checked) => update({ moduleReveal: checked })}
          />
          <PreferenceRow
            title="Auto-sync wallet"
            description="Keep the preference flag that future wallet surfaces can honor."
            checked={prefs.autoSyncWallet}
            onChange={(checked) => update({ autoSyncWallet: checked })}
          />
        </section>

        <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-medium text-zinc-100">Diagnostics & storage</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/mobile-only/pwa"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Open PWA diagnostics
            </Link>
            <button
              onClick={handleClearCaches}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Clear local cache
            </button>
            <button
              onClick={handleClearSession}
              className="rounded-xl border border-red-400/30 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
            >
              Clear session only
            </button>
          </div>
          {message && <p className="text-sm text-zinc-300">{message}</p>}
        </section>
      </div>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-3">
      <div>
        <div className="text-sm font-medium text-zinc-100">{title}</div>
        <div className="mt-1 text-sm text-zinc-400">{description}</div>
      </div>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
