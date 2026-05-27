"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppStage from "@/components/ui/AppStage";
import PanelShell, { PanelSection } from "@/components/ui/PanelShell";
import { listAppNotifications, markNotificationsSeen } from "@/lib/mobile/notifications";
import { setNotificationCount, useAccount } from "@/state/useAccount";

export default function NotificationsPage() {
  const account = useAccount();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAppNotifications>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      const next = await listAppNotifications();
      if (!active) return;
      setRows(next);
      setLoading(false);
      await markNotificationsSeen();
      if (active) setNotificationCount(0);
    };

    void sync();
    return () => {
      active = false;
    };
  }, []);

  const statusCard = useMemo(() => {
    if (!account.trusted) {
      return {
        title: "Activation available",
        body: "Activate on this device to save wallet, exchange, and Vitae events locally.",
      };
    }
    if (!account.chainAddress) {
      return {
        title: "Wallet unbound",
        body: "Your device session is active, but ARCnet settlement is not bound to a chain address yet.",
      };
    }
    return {
      title: "Wallet bound",
      body: account.statusMessage ?? "ARCnet sync is available from Account and Wallet.",
    };
  }, [account]);

  return (
    <AppStage>
      <PanelShell title="Notifications" flush className="flex-1">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Receipt-backed system notices for this device session. Opening this page marks local
            notices as seen.
          </p>

          <PanelSection title="Session status">
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="font-medium text-zinc-100">{statusCard.title}</div>
              <p>{statusCard.body}</p>
            </div>
          </PanelSection>

          <PanelSection title="Recent notices">
            {loading ? (
              <div className="text-sm text-zinc-400">Loading notifications…</div>
            ) : rows.length === 0 ? (
              <div className="space-y-3 text-sm text-zinc-300">
                <p>No notices yet. Account, Wallet, Exchange, and Vitae actions will appear here.</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/account" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10">
                    Open account
                  </Link>
                  <Link href="/wallet" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10">
                    Open wallet
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((row) => (
                  <article key={row.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span>{row.kind}</span>
                      <span>•</span>
                      <span>{new Date(row.createdAt).toLocaleString()}</span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 uppercase text-[10px]">
                        {row.level}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-zinc-100">{row.title}</div>
                    <div className="mt-1 text-sm text-zinc-300">{row.body}</div>
                  </article>
                ))}
              </div>
            )}
          </PanelSection>
        </div>
      </PanelShell>
    </AppStage>
  );
}
