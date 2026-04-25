"use client";

import { useMemo, useState } from "react";
import { usePWADiagnostics } from "@/hooks/usePWADiagnostics";

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/20 p-3">
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      <span className={mono ? "break-all font-mono text-sm text-white" : "text-sm text-white"}>
        {value}
      </span>
    </div>
  );
}

function BoolPill({ value }: { value: boolean }) {
  return (
    <span
      className={
        value
          ? "inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200"
          : "inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70"
      }
    >
      {value ? "yes" : "no"}
    </span>
  );
}

export default function PWADiagnosticsPage() {
  const { data, loading, refresh } = usePWADiagnostics();
  const [copied, setCopied] = useState(false);

  const raw = useMemo(() => JSON.stringify(data, null, 2), [data]);

  async function handleCopy() {
    try {
      if (!("clipboard" in navigator)) return;
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">PWA Diagnostics</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Local, read-only diagnostics for mobile install and runtime state. Use this
              page in Work Chrome, personal Chrome, Brave, and any installed app surface to
              compare actual behavior.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={refresh}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <BoolPill value={!loading} />
          <BoolPill value={data.secureContext} />
          <BoolPill value={data.serviceWorkerSupported} />
          <BoolPill value={data.serviceWorkerController} />
          <BoolPill value={data.standalone} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Row label="Display mode" value={data.displayMode} />
        <Row label="Standalone" value={data.standalone ? "true" : "false"} />
        <Row label="iOS standalone" value={data.iosStandalone ? "true" : "false"} />
        <Row label="Secure context" value={data.secureContext ? "true" : "false"} />
        <Row label="Online" value={data.online ? "true" : "false"} />
        <Row label="Visibility" value={data.visibilityState} />
        <Row
          label="Service worker supported"
          value={data.serviceWorkerSupported ? "true" : "false"}
        />
        <Row
          label="Service worker controller"
          value={data.serviceWorkerController ? "true" : "false"}
        />
        <Row
          label="Service worker registrations"
          value={String(data.serviceWorkerRegistrationCount)}
        />
        <Row
          label="Install prompt seen this view"
          value={data.beforeInstallPromptSeenThisView ? "true" : "false"}
        />
        <Row
          label="App installed seen this view"
          value={data.appInstalledSeenThisView ? "true" : "false"}
        />
        <Row label="Generated at" value={data.generatedAt} mono />
      </section>

      <section className="grid gap-3">
        <Row label="Manifest href" value={data.manifestHref ?? "not found"} mono />
        <Row
          label="Controller script URL"
          value={data.serviceWorkerControllerScriptURL ?? "not controlling this page"}
          mono
        />
        <Row
          label="Registration scopes"
          value={
            data.serviceWorkerRegistrationScopes.length > 0
              ? data.serviceWorkerRegistrationScopes.join("\n")
              : "none"
          }
          mono
        />
        <Row label="Page href" value={data.href} mono />
        <Row label="Referrer" value={data.referrer || "none"} mono />
        <Row label="User agent" value={data.userAgent} mono />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-medium text-white/80">Raw JSON</h2>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-white/80">
          {raw}
        </pre>
      </section>
    </main>
  );
}
