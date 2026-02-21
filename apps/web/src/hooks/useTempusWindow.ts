'use client';

import { useEffect, useMemo, useState } from 'react';
import { computeWindowState, type WindowConfig, type WindowState } from '@/lib/tempus/window';

export function useTempusWindow(config: WindowConfig = {}): WindowState {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // 30s cadence: updates state without “countdown” energy
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => computeWindowState(now, config), [now, config]);
}