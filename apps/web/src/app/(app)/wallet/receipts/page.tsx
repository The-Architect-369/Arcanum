"use client";

import { useEffect, useMemo, useState } from "react";
import AppStage from "@/components/ui/AppStage";
import ModuleTabRail from "@/components/ui/ModuleTabRail";
import PanelShell, { PanelSection } from "@/components/ui/PanelShell";
import SwipeRoutes from "@/components/ui/SwipeRoutes";
import { LocalReceipt, listReceipts } from "@/lib/mobile/persistence";
import { getRitesState, summarizeRites } from "@/lib/mobile/rites";

const ORDER = ["/wallet/balances", "/wallet/receipts", "/wallet/vault"] as const;
const TABS = [
  { href: ORDER[0], label: "Balances" },
  { href: ORDER[1], label: "Receipts" },
  { href: ORDER[2], label: "Vault" },
] as const;

export default function WalletReceiptsPage() {
  const [rows, setRows] = useState<LocalReceipt[]>([]);
  const [ritesState, setRitesState] = useState<Awaited<ReturnType<typeof getRitesState>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [nextReceipts, nextRites] = await Promise.all([listReceipts(100), getRitesState()]);
      if (active) {
        setRows(nextReceipts);
        setRitesState(nextRites);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const ritesSummary = useMemo(
    () => summarizeRites(ritesState ?? { credits: [], updatedAt: null }),
    [ritesState]
  );

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
              Local factual receipts for activation, sync, participation credit, and spend events on this device.
            </p>

            <PanelSection title="Local RITES summary">
              <div className="grid gap-3 md:grid-cols-4">
                <SummaryCard label="Active credits" value={String(ritesSummary.activeCount)} />
                <SummaryCard label="Amount" value={String(ritesSummary.activeAmount)} />
                <SummaryCard label="Voided" value={String(ritesSummary.voidedCount)} />
                <SummaryCard label="Conversion" value={ritesSummary.conversionStatus} />
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                RITES are local non-transferable participation memory in this scaffold. They are not MANA, not a wallet balance,
                not authority, and not convertible without future governed policy.
              </p>
            </PanelSection>

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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-sm text-zinc-100">{value}</div>
    </div>
  );
}
