"use client";

import { useMemo, useState } from "react";
import AppStage from "@/components/ui/AppStage";
import PanelShell, { PanelSection } from "@/components/ui/PanelShell";
import CTAActivate from "@/components/shared/CTAActivate";
import { LockHint } from "@/components/shared/LockHint";
import { addReceipt } from "@/lib/mobile/persistence";
import { useAccount } from "@/state/useAccount";

const ACTIONS = [
  { value: "send", label: "Send MANA" },
  { value: "receive", label: "Receive MANA" },
  { value: "swap", label: "Prepare swap" },
] as const;

type ExchangeAction = (typeof ACTIONS)[number]["value"];

export default function ExchangePage() {
  const account = useAccount();
  const [action, setAction] = useState<ExchangeAction>("send");
  const [amount, setAmount] = useState("1");
  const [counterparty, setCounterparty] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const amountNumber = Math.max(0, Math.floor(Number(amount) || 0));

  const availability = useMemo(() => {
    if (!account.trusted) return "requires setup";
    if (!account.chainAddress) return "requires wallet confirmation";
    return "available";
  }, [account]);

  async function prepareIntent() {
    setMessage(null);

    if (!account.trusted) {
      setMessage("Exchange intent requires setup on this device first.");
      return;
    }

    if (!account.chainAddress) {
      setMessage("Bind a chain address before preparing an exchange intent.");
      return;
    }

    if (amountNumber <= 0) {
      setMessage("Enter a positive amount.");
      return;
    }

    if (action === "send" && amountNumber > account.mana) {
      setMessage("Not enough local MANA available for that intent.");
      return;
    }

    await addReceipt({
      kind: "exchange_intent",
      title: "Exchange intent prepared",
      summary: `${ACTIONS.find((item) => item.value === action)?.label} · ${amountNumber} MANA${counterparty ? ` · ${counterparty}` : ""}`,
      amount: amountNumber,
      status: "info",
      metadata: {
        action,
        counterparty: counterparty || null,
        chainAddress: account.chainAddress,
      },
    });

    setMessage("Prepared a local exchange intent. No settlement was executed.");
  }

  return (
    <AppStage>
      <PanelShell title="Exchange" flush className="flex-1">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Exchange is an intent surface right now. It can prepare a mobile-side draft and record a
            receipt without pretending settlement already happened.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            <StatusCard label="Availability" value={availability} />
            <StatusCard label="Local MANA" value={String(account.mana)} />
            <StatusCard label="Chain address" value={account.chainAddress ?? "Not bound"} mono />
          </div>

          {!account.trusted && (
            <PanelSection title="Activation required">
              <div className="space-y-3 text-sm text-zinc-300">
                <p>Basic browsing remains open, but preparing exchange intents requires setup.</p>
                <CTAActivate />
              </div>
            </PanelSection>
          )}

          <PanelSection title="Prepare intent">
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs uppercase tracking-wide text-zinc-500">Action</span>
                  <select
                    value={action}
                    onChange={(event) => setAction(event.target.value as ExchangeAction)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  >
                    {ACTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-xs uppercase tracking-wide text-zinc-500">Amount</span>
                  <input
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    inputMode="numeric"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-xs uppercase tracking-wide text-zinc-500">Counterparty / note</span>
                <input
                  value={counterparty}
                  onChange={(event) => setCounterparty(event.target.value)}
                  placeholder="Address, alias, or note"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                {!account.chainAddress && <LockHint label="Wallet confirmation required" />}
                <button
                  onClick={() => {
                    void prepareIntent();
                  }}
                  className="rounded-xl border border-amber-300/40 px-4 py-2 text-sm text-amber-300 hover:bg-amber-300/10"
                >
                  Prepare local intent
                </button>
              </div>

              {message && <p>{message}</p>}
            </div>
          </PanelSection>
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
      <div className={mono ? "mt-1 break-all font-mono text-sm text-zinc-100" : "mt-1 text-sm text-zinc-100"}>
        {value}
      </div>
    </div>
  );
}
