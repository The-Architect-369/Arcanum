'use client';

import { useMemo } from 'react';
import type { HopeState } from '@/lib/hope/context';
import { deriveHopeRenderState } from '@/lib/hope/render';

export function useHopeRenderState(state: HopeState, options: { trusted?: boolean } = {}) {
  const trusted = options.trusted;
  return useMemo(() => deriveHopeRenderState(state, { trusted }), [state, trusted]);
}
