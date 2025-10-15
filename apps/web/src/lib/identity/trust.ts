'use client';

/**
 * Single source of truth for guest vs trusted (ACC present) gating.
 * Dev override: localStorage.setItem('arcanum_trusted','1')
 */
import { useEffect, useState } from 'react';

export function useIsTrusted(): boolean {
  const [trusted, setTrusted] = useState(false);

  useEffect(() => {
    // 1) Dev override for demos
    const dev = typeof window !== 'undefined' && window.localStorage.getItem('arcanum_trusted') === '1';
    if (dev) {
      setTrusted(true);
      return;
    }

    // 2) Try your real account state if present (state/useAccount)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('@/state/useAccount');
      const hook = (mod?.useAccount ?? mod?.default) as (() => any) | undefined;
      const acct = hook ? hook() : undefined;
      // Consider "trusted", "verified", or boolean 'trusted' true as trusted state
      const status = (acct?.status ?? acct?.state)?.toString?.().toLowerCase?.();
      setTrusted(Boolean(acct?.trusted) || status === 'trusted' || status === 'verified');
      return;
    } catch {
      // fall through to false
    }

    setTrusted(false);
  }, []);

  return trusted;
}
