'use client';

/**
 * Single source of truth for guest vs trusted (ACC present) gating.
 * Dev override: localStorage.setItem('arcanum_trusted','1')
 */
import { useEffect, useState } from 'react';

import { useAccount } from '@/state/useAccount';

export function useIsTrusted(): boolean {
  const account = useAccount();
  const [devOverride, setDevOverride] = useState(false);

  useEffect(() => {
    try {
      setDevOverride(window.localStorage.getItem('arcanum_trusted') === '1');
    } catch {
      setDevOverride(false);
    }
  }, []);

  return devOverride || account.trusted;
}
