"use client";

import { spendMana } from "@/state/useAccount";
export { canUseLocalSpendPreview } from "@/state/useAccount";

export function trySpendMana(amount: number, reason = "utility spend"): boolean {
  if (!Number.isSafeInteger(amount) || amount < 0) return false;
  if (amount === 0) return true;
  // One local preview receipt is produced by the account boundary, not a second
  // apparent economic event here. The purpose must survive that boundary.
  return spendMana(amount, { purpose: reason });
}
