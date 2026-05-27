"use client";

import { useMemo, useState } from "react";
import { usePWADiagnostics } from "@/hooks/usePWADiagnostics";
import { promptToInstall } from "@/lib/mobile/installPrompt";

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

function BoolPill({ value, label }: { value: boolean; label?: string }) {
  return (
    <span
      className={
        value
          ? "inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200"
          : "inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70"
      }
    >
      {label ? `${label}: ` : ""}
      {value ? "yes" : "no"}
    </span>
  );
}

function formatBytes(value: number | null) {
  if (typeof value !== "number") return "unknown";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function PWADiagnosticsPage() {
  const { data, loading, refresh } = usePWADiagnostics();
  const [copied, setCopied] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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

  async function handleInstall() {
    const result = await promptToInstall();
    if (!result.available) {
      setActionMessage("Install prompt is not available in this browser view.");
      return;
    }
    setActionMessage(
      result.outcome === "accepted"
        ? "Install accepted. Finish the browser prompt to complete installation."
        : "Install prompt dismissed."
    );
    refresh();
  }

  async function handleRequestPersistentStorage() {
    const storageManager = navigator.storage;
    if (!storageManager?.persist) {
      setActionMessage("Persistent storage is not supported in this browser.");
      return;
    }
    try {
      const granted = await storageManager.persist();
      setActionMessage(
        granted ? "Persistent storage granted for this app surface." : "Persistent storage was not granted."
      );
      refresh();
    } catch {
      setActionMessage("Could not request persistent storage.");
    }
  }

  async function handleCheckForUpdates() {
    if (!("serviceWorker" in navigator)) {
      setActionMessage("Service workers are not supported here.");
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      setActionMessage("No service worker registration was found.");
      return;
    }
    try {
      await registration.update();
      setActionMessage("Checked for updates. Refresh the page diagnostics in a moment.");
      refresh();
    } catch {
      setActionMessage("Service worker update check failed.");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">PWA Diagnostics</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Local, read-only diagnostics for mobile install and runtime state. Use this page on
              Android browser tabs, installed app surfaces, and alternate browsers to compare actual
              device behavior.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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
          <BoolPill value={!loading} label="Loaded" />
          <BoolPill value={data.secureContext} label="Secure" />
          <BoolPill value={data.serviceWorkerSupported} label="SW" />
          <BoolPill value={data.serviceWorkerController} label="Controlled" />
          <BoolPill value={data.standalone} label="Standalone" />
          <BoolPill value={data.passkeySupported} label="Passkey" />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleInstall}
            disabled={!data.installPromptAvailable}
            className="rounded-xl border border-amber-300/40 px-3 py-2 text-sm text-amber-200 hover:bg-amber-300/10 disabled:opacity-50"
          >
            Prompt install
          </button>
          <button
            type="button"
            onClick={handleRequestPersistentStorage}
            disabled={!data.storageManagerSupported}
            className="rounded-xl border border-sky-300/40 px-3 py-2 text-sm text-sky-200 hover:bg-sky-300/10 disabled:opacity-50"
          >
            Request persistent storage
          </button>
          <button
            type="button"
            onClick={handleCheckForUpdates}
            disabled={!data.serviceWorkerSupported}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
          >
            Check for SW update
          </button>
        </div>
        {actionMessage && <p className="mt-3 text-sm text-white/70">{actionMessage}</p>}
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
        <Row label="Service worker waiting" value={data.serviceWorkerWaiting ? "true" : "false"} />
        <Row
          label="Install prompt seen this view"
          value={data.beforeInstallPromptSeenThisView ? "true" : "false"}
        />
        <Row label="Install prompt available" value={data.installPromptAvailable ? "true" : "false"} />
        <Row
          label="App installed seen this view"
          value={data.appInstalledSeenThisView ? "true" : "false"}
        />
        <Row label="Persistent storage" value={data.storagePersisted ? "true" : "false"} />
        <Row label="Storage usage" value={formatBytes(data.storageUsageBytes)} />
        <Row label="Storage quota" value={formatBytes(data.storageQuotaBytes)} />
        <Row label="Notifications supported" value={data.notificationsSupported ? "true" : "false"} />
        <Row label="Notification permission" value={data.notificationPermission} />
        <Row label="Passkey supported" value={data.passkeySupported ? "true" : "false"} />
        <Row label="Passkey support reason" value={data.passkeySupportReason} />
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
