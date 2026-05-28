"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  clearAccountSession,
  setShowOnboarding,
  syncChainBalance,
  useAccount,
} from "@/state/useAccount";
import { clearPasskey } from "@/lib/identity/passkey";
import { forgetBurner } from "@/lib/identity/burner";
import PanelShell, { PanelSection } from "@/components/ui/PanelShell";
import AppStage from "@/components/ui/AppStage";

function truncate(value: string | null | undefined, head = 8, tail = 6) {
  if (!value) return "—";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export default function AccountPage() {
  const account = useAccount();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<"sync" | "reset" | null>(null);

  const statusLabel = useMemo(() => {
    if (!account.trusted) return "Not activated";
    if (account.settlementStatus === "bound") return "Activated + bound";
    if (account.settlementStatus === "syncing") return "Syncing";
    if (account.settlementStatus === "error") return "Activated + sync issue";
    return "Activated on device";
  }, [account]);

  async function handleSync() {
    setBusy("sync");
    setMessage(null);
    const result = await syncChainBalance();
    setMessage(
      result.ok
        ? `Wallet synced at ${result.syncedAt}.${result.chainAnchorTokenId ? ` Anchor ${result.chainAnchorTokenId}.` : ""}`
        : result.message
    );
    setBusy(null);
  }

  async function handleReset() {
    setBusy("reset");
    setMessage(null);
    await Promise.all([clearPasskey(), forgetBurner(), clearAccountSession()]);
    setMessage("Cleared device session, burner, and stored passkey metadata.");
    setBusy(null);
  }

  return (
    <AppStage>
      <PanelShell title="Account" flush className="flex-1">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Mobile account state is persisted outside transient view state. When a chain address is
            bound, this surface can now read live ARCnet MANA and chaincode anchor state.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <StatusCard label="Account status" value={statusLabel} />
            <StatusCard label="Identity source" value={account.identitySource} />
            <StatusCard label="Identity ID" value={truncate(account.identityId)} mono />
            <StatusCard label="Chain address" value={truncate(account.chainAddress)} mono />
            <StatusCard label="Chain anchor" value={truncate(account.chainAnchorTokenId)} mono />
            <StatusCard label="MANA" value={String(account.mana)} />
            <StatusCard label="Tracked supply" value={account.manaSupply ?? "Unknown"} mono />
            <StatusCard label="Last sync" value={account.lastSyncedAt ?? "Never"} mono />
          </div>

          <PanelSection title="Session posture">
            <div className="space-y-2 text-sm text-zinc-300">
              <p>
                Activation is device-local until a chain address is bound. Once bound, ARCnet becomes
                the balance and anchor witness layer instead of a cosmetic side sync.
              </p>
              <p>{account.statusMessage ?? "No status message yet."}</p>
            </div>
          </PanelSection>

          <PanelSection title="Chaincode witness">
            <div className="space-y-2 text-sm text-zinc-300">
              <p>
                {account.chainAnchorTokenId
                  ? `This account is currently witnessed on ARCnet as ${account.chainAnchorTokenId}.`
                  : "No ARCnet chaincode anchor has been found for the bound address yet."}
              </p>
              {account.chainAnchorMetadata && (
                <p className="break-all font-mono text-xs text-zinc-400">{account.chainAnchorMetadata}</p>
              )}
            </div>
          </PanelSection>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowOnboarding(true)}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Open activation
            </button>

            <button
              onClick={handleSync}
              disabled={busy === "sync" || !account.chainAddress}
              className="rounded-xl border border-amber-300/40 px-4 py-2 text-sm text-amber-300 hover:bg-amber-300/10 disabled:opacity-50"
            >
              {busy === "sync" ? "Syncing…" : "Sync ARCnet state"}
            </button>

            <Link
              href="/wallet"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Open wallet
            </Link>

            <button
              onClick={handleReset}
              disabled={busy === "reset"}
              className="rounded-xl border border-red-400/30 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10 disabled:opacity-50"
            >
              {busy === "reset" ? "Clearing…" : "Reset local session"}
            </button>
          </div>

          {message && (
            <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-200">
              {message}
            </div>
          )}
        </div>
      </PanelShell>
    </AppStage>
  );
}

function StatusCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div
        className={mono ? "mt-1 break-all font-mono text-sm text-zinc-100" : "mt-1 text-sm text-zinc-100"}
      >
        {value}
      </div>
    </div>
  );
}
