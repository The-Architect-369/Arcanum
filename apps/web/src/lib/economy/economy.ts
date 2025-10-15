'use client';
import { useAccount } from '@/state/useAccount';

export function trySpendMana(amount: number): boolean {
  try {
    const acc: any = useAccount();
    if (typeof acc?.spendMana === 'function') { acc.spendMana(amount); return true; }
    if (typeof acc?.getMana === 'function' && typeof acc?.setMana === 'function') {
      const cur = Number(acc.getMana());
      if (Number.isFinite(cur) && cur >= amount) { acc.setMana(cur - amount); return true; }
    }
  } catch {}
  return false;
}
