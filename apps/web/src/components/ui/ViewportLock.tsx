'use client';

import { useEffect } from 'react';

export default function ViewportLock() {
  useEffect(() => {
    const root = document.documentElement;

    const candidates = [
      window.screen?.height,
      window.screen?.availHeight,
      window.innerHeight,
      window.visualViewport?.height,
    ].filter((value): value is number => Number.isFinite(value) && Number(value) > 0);

    const stableHeight = candidates.length ? Math.max(...candidates) : 0;

    if (stableHeight) {
      root.style.setProperty('--arcanum-locked-vh', `${Math.round(stableHeight)}px`);
    }

    return () => {
      root.style.removeProperty('--arcanum-locked-vh');
    };
  }, []);

  return null;
}
