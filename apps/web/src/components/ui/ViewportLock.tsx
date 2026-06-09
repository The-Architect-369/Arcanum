'use client';

import { useEffect } from 'react';

export default function ViewportLock() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const lock = () => {
      if (frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const visualHeight = window.visualViewport?.height;
        const layoutHeight = window.innerHeight;
        const fallbackHeight = window.screen?.availHeight;
        const height = [visualHeight, layoutHeight, fallbackHeight]
          .find((value) => Number.isFinite(value) && Number(value) > 0);

        if (!height) return;

        root.style.setProperty('--arcanum-locked-vh', `${Math.round(height)}px`);
        frame = 0;
      });
    };

    lock();
    window.addEventListener('resize', lock);
    window.addEventListener('orientationchange', lock);
    window.visualViewport?.addEventListener('resize', lock);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', lock);
      window.removeEventListener('orientationchange', lock);
      window.visualViewport?.removeEventListener('resize', lock);
    };
  }, []);

  return null;
}
