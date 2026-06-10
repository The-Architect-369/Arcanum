'use client';

import { useEffect } from 'react';

export default function ViewportLock() {
  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--arcanum-locked-vh', '100svh');

    return () => {
      root.style.removeProperty('--arcanum-locked-vh');
    };
  }, []);

  return null;
}
