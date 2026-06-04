"use client";

import { useMemo, useState } from "react";
import AppStage from "@/components/ui/AppStage";
import ModuleTabRail from "@/components/ui/ModuleTabRail";
import PanelShell, { PanelSection } from "@/components/ui/PanelShell";
import SwipeRoutes from "@/components/ui/SwipeRoutes";
import { createWalletContext } from "@/lib/wallet/context";
import { syncChainBalance, useAccount } from "@/state/useAccount";

const ORDER = ["/wallet/balances", "/wallet/receipts", "/wallet/vault"] as const;
const TABS = [
  { href: ORDER[0], label: "Balances" },
  { href: ORDER[1], label: "Receipts" },
  { href: ORDER[2], label: "Vault" },
] as const;

const baseDenom =
  process.env.NEXT_PUBLIC_ARCANUM_BASE_DENOM ||
  process.env.NEXT_PUBLIC_ARC_DENOM ||
  "umana";

export default function WalletBalancesPage() {
  const account = useAccount();
  const walletContext = useMemo(() => createWalletContext(account, { denom: baseDenom }), [account]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSync() {
    setBusy(true);
    setMessage(null);
    const result = await syncChainBalance();
    setMessage(
      result.ok
        ? `Synced ${result.amount} ${result.denom} from ${result.source}.${result.supply ? ` Supply ${result.supply}.` : ""}`
        : result.message
    );
    setBusy(false);
  }

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell
          title="Wallet — Balances"
          tabs={<ModuleTabRail tabs={TABS} />}
          flush
          className="min-h-0 flex-1"
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              This surface now prefers live ARCnet module queries for MANA balance, chaincode anchor,
              and tracked supply when a chain address is bound.
            </p>

            <div className="grid gap-3 md:grid-cols-4">
              <BalanceCard label="MANA" value={`${account.mana} ${baseDenom}`} />
              <BalanceCard label="Tracked supply" value={account.manaSupply ?? "Unknown"} />
              <BalanceCard
                label="Settlement"
                value={account.chainAddress ? "Bound to chain address" : "Device-only"}
              />
              <BalanceCard label="Last sync" value={account.lastSyncedAt ?? "Never"} />
            </div>

            <PanelSection title="Wallet context">
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="grid gap-3 md:grid-cols-3">
                  <BalanceCard label="Context" value={walletContext.version} />
                  <BalanceCard label="Status" value={walletContext.settlementStatus} />
                  <BalanceCard label="Source" value={walletContext.balances[0]?.source ?? "unknown"} />
                </div>
                <p className="text-xs text-zinc-400">
                  Wallet context distinguishes local scaffold state from chain-witnessed state. It does not grant authority,
                  recognition, readiness, or treasury access.
                </p>
                {walletContext.warnings.length > 0 && (
                  <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100">
                    <div className="font-medium">Warnings</div>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      {walletContext.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </PanelSection>

            <PanelSection title="Chain address">
              <div className="space-y-2 text-sm text-zinc-300">
                <p className="break-all font-mono text-xs text-zinc-400">
                  {account.chainAddress ?? "No chain address bound yet."}
                </p>
                <p>
                  {account.chainAnchorTokenId
                    ? `ARCnet chaincode witness: ${account.chainAnchorTokenId}`
                    : "No ARCnet chaincode witness found for this address yet."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSync}
                    disabled={busy || !account.chainAddress}
                    className="rounded-xl border border-amber-300/40 px-4 py-2 text-sm text-amber-300 hover:bg-amber-300/10 disabled:opacity-50"
                  >
                    {busy ? "Syncing…" : "Sync from ARCnet"}
                  </button>
                </div>
                {message && <p>{message}</p>}
              </div>
            </PanelSection>
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}

function BalanceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-sm text-zinc-100">{value}</div>
    </div>
  );
}
