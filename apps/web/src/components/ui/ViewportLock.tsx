'use client';

import { useEffect } from 'react';

export default function ViewportLock() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let lockedHeight = 0;

    const measureStableHeight = () => {
      const screenHeight = window.screen?.availHeight;
      const layoutHeight = window.innerHeight;
      const visualHeight = window.visualViewport?.height;
      const candidates = [screenHeight, layoutHeight, visualHeight]
        .filter((value): value is number => Number.isFinite(value) && Number(value) > 0);

      return Math.max(...candidates);
    };

    const lock = (force = false) => {
      if (frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const measured = measureStableHeight();
        if (!measured) return;

        if (force || !lockedHeight || Math.abs(measured - lockedHeight) > 96) {
          lockedHeight = measured;
          root.style.setProperty('--arcanum-locked-vh', `${Math.round(lockedHeight)}px`);
        }

        frame = 0;
      });
    };

    lock(true);
    window.addEventListener('orientationchange', () => lock(true));

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('orientationchange', () => lock(true));
    };
  }, []);

  return null;
}
