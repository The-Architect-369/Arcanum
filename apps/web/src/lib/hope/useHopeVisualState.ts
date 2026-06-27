'use client';

import { useMemo } from 'react';
import type { HopeRenderState } from '@/lib/hope/render';
import { mapHopeRenderStateToVisualState } from '@/lib/hope/visual';

export function useHopeVisualState(renderState: HopeRenderState) {
  return useMemo(() => mapHopeRenderStateToVisualState(renderState), [renderState]);
}
