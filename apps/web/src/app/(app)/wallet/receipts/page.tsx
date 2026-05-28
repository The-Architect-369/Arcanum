"use client";

import { useEffect, useState } from "react";
import AppStage from "@/components/ui/AppStage";
import ModuleTabRail from "@/components/ui/ModuleTabRail";
import PanelShell, { PanelSection } from "@/components/ui/PanelShell";
import SwipeRoutes from "@/components/ui/SwipeRoutes";
import { LocalReceipt, listReceipts } from "@/lib/mobile/persistence";

const ORDER = ["/wallet/balances", "/wallet/receipts", "/wallet/vault"] as const;
const TABS = [
  { href: ORDER[0], label: "Balances" },
  { href: ORDER[1], label: "Receipts" },
  { href: ORDER[2], label: "Vault" },
] as const;

export default function WalletReceiptsPage() {
  const [rows, setRows] = useState<LocalReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const next = await listReceipts(100);
      if (active) {
        setRows(next);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell
          title="Wallet — Receipts"
          tabs={<ModuleTabRail tabs={TABS} />}
          flush
          className="min-h-0 flex-1"
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Local factual receipts for activation, sync, and spend events on this device.
            </p>

            <PanelSection title="Recent receipts">
              {loading ? (
                <div className="text-sm text-zinc-400">Loading receipts…</div>
              ) : rows.length === 0 ? (
                <div className="text-sm text-zinc-400">No receipts recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {rows.map((row) => (
                    <article
                      key={row.id}
                      className="rounded-xl border border-white/10 bg-black/30 p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        <span>{row.kind}</span>
                        <span>•</span>
                        <span>{new Date(row.createdAt).toLocaleString()}</span>
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase">
                          {row.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-medium text-zinc-100">{row.title}</div>
                      {row.summary && <div className="mt-1 text-sm text-zinc-300">{row.summary}</div>}
                      {typeof row.amount === "number" && (
                        <div className="mt-2 text-xs text-amber-300">Amount: {row.amount}</div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </PanelSection>
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
