'use client';

import { useEffect } from 'react';

export default function ViewportLock() {
  useEffect(() => {
    const root = document.documentElement;

    const lock = () => {
      const candidates = [
        window.innerHeight,
        window.visualViewport?.height ?? 0,
        window.screen?.height ?? 0,
      ].filter((value) => Number.isFinite(value) && value > 0);

      const height = Math.max(...candidates);
      root.style.setProperty('--arcanum-locked-vh', `${Math.round(height)}px`);
    };

    lock();
    window.addEventListener('orientationchange', lock);

    return () => {
      window.removeEventListener('orientationchange', lock);
    };
  }, []);

  return null;
}
