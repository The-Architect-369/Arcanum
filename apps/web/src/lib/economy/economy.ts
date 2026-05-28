"use client";

import { addReceipt } from "@/lib/mobile/persistence";
import { spendMana } from "@/state/useAccount";

export function trySpendMana(amount: number, reason = "utility spend"): boolean {
  const safeAmount = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
  if (safeAmount <= 0) return true;

  const ok = spendMana(safeAmount);
  if (!ok) return false;

  void addReceipt({
    kind: "mana_spend",
    title: "MANA spent",
    summary: `${safeAmount} MANA spent for ${reason}.`,
    amount: safeAmount,
    status: "confirmed",
    metadata: { reason },
  });

  return true;
}
