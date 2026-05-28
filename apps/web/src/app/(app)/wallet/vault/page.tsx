"use client";

import { useEffect, useState } from "react";
import AppStage from "@/components/ui/AppStage";
import ModuleTabRail from "@/components/ui/ModuleTabRail";
import PanelShell, { PanelSection } from "@/components/ui/PanelShell";
import SwipeRoutes from "@/components/ui/SwipeRoutes";
import { getBurnerRecord } from "@/lib/identity/burner";
import { getPasskey, StoredPasskey } from "@/lib/identity/passkey";
import { listIPFSRecords } from "@/lib/mobile/persistence";
import { useAccount } from "@/state/useAccount";

const ORDER = ["/wallet/balances", "/wallet/receipts", "/wallet/vault"] as const;
const TABS = [
  { href: ORDER[0], label: "Balances" },
  { href: ORDER[1], label: "Receipts" },
  { href: ORDER[2], label: "Vault" },
] as const;

type VaultSummary = {
  passkey: StoredPasskey | null;
  burnerId: string | null;
  cachedContentCount: number;
};

export default function WalletVaultPage() {
  const account = useAccount();
  const [summary, setSummary] = useState<VaultSummary>({
    passkey: null,
    burnerId: null,
    cachedContentCount: 0,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const [passkey, burner, ipfsEntries] = await Promise.all([
        getPasskey(),
        getBurnerRecord(),
        listIPFSRecords(500),
      ]);
      if (!active) return;
      setSummary({
        passkey,
        burnerId: burner?.id ?? null,
        cachedContentCount: ipfsEntries.length,
      });
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell
          title="Wallet — Vault"
          tabs={<ModuleTabRail tabs={TABS} />}
          flush
          className="min-h-0 flex-1"
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              The vault shows the mobile identity artifacts and local content-addressed cache that
              back this device session.
            </p>

            <PanelSection title="Identity artifacts">
              <div className="grid gap-3 md:grid-cols-2">
                <VaultCard
                  label="Account identity"
                  value={account.identityId ?? "Not activated"}
                  mono
                />
                <VaultCard
                  label="Stored passkey"
                  value={summary.passkey ? summary.passkey.id : "None"}
                  mono
                />
                <VaultCard
                  label="Stored burner"
                  value={summary.burnerId ?? "None"}
                  mono
                />
                <VaultCard
                  label="Cached content objects"
                  value={String(summary.cachedContentCount)}
                />
              </div>
            </PanelSection>
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}

function VaultCard({
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
