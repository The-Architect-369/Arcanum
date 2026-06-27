import type { HopeRenderState } from '@/lib/hope/render';

export type HopeVisualState = {
  avatar: {
    form: 'orb';
    openness: number;
    gazeSoftness: number;
    silhouetteScale: number;
  };
  aura: {
    intensity: number;
    radius: number;
    bloom: number;
    pulseRate: 'still' | 'slow' | 'medium';
    ringCount: 0 | 1 | 2 | 3;
  };
  motion: {
    profile: 'calm' | 'active' | 'transitional';
    drift: 'none' | 'low' | 'medium';
    breathMs: number;
    shimmer: 'off' | 'soft' | 'present';
    transitionMs: number;
  };
  palette: {
    field: string;
    core: string;
    aura: string;
    contrast: 'low' | 'medium';
  };
  environment: {
    backgroundField: 'still' | 'breathing' | 'attuned';
    particleDensity: 'none' | 'low' | 'soft';
    focusVignette: 'soft' | 'present';
  };
};

function toUnit(value: number) {
  return Math.min(1, Math.max(0, value / 100));
}

export function mapHopeRenderStateToVisualState(renderState: HopeRenderState): HopeVisualState {
  const presenceUnit = toUnit(renderState.presencePercent);

  const palette =
    renderState.emotionalPreset === 'emergent'
      ? {
          field: 'rgba(56, 189, 248, 0.22)',
          core: 'rgba(251, 191, 36, 0.34)',
          aura: 'rgba(125, 211, 252, 0.34)',
          contrast: 'medium' as const,
        }
      : renderState.emotionalPreset === 'reflective'
        ? {
            field: 'rgba(99, 102, 241, 0.22)',
            core: 'rgba(196, 181, 253, 0.32)',
            aura: 'rgba(129, 140, 248, 0.3)',
            contrast: 'low' as const,
          }
        : {
            field: 'rgba(71, 85, 105, 0.24)',
            core: 'rgba(148, 163, 184, 0.28)',
            aura: 'rgba(125, 211, 252, 0.2)',
            contrast: 'low' as const,
          };

  return {
    avatar: {
      form: 'orb',
      openness: 0.36 + presenceUnit * 0.44,
      gazeSoftness: renderState.emotionalPreset === 'reflective' ? 0.88 : 0.72,
      silhouetteScale: 0.9 + presenceUnit * 0.12,
    },
    aura: {
      intensity: Number((0.22 + presenceUnit * 0.68).toFixed(2)),
      radius: Math.round(108 + presenceUnit * 72),
      bloom: Number((0.18 + presenceUnit * 0.42).toFixed(2)),
      pulseRate:
        renderState.presenceMode === 'active'
          ? 'medium'
          : renderState.presenceMode === 'transitioning'
            ? 'slow'
            : 'still',
      ringCount:
        renderState.presencePercent >= 80 ? 3 : renderState.presencePercent >= 58 ? 2 : renderState.presencePercent >= 34 ? 1 : 0,
    },
    motion: {
      profile:
        renderState.presenceMode === 'active'
          ? 'active'
          : renderState.presenceMode === 'transitioning'
            ? 'transitional'
            : 'calm',
      drift:
        renderState.presenceMode === 'active'
          ? 'medium'
          : renderState.presenceMode === 'transitioning'
            ? 'low'
            : 'none',
      breathMs:
        renderState.presenceMode === 'active'
          ? 3600
          : renderState.presenceMode === 'transitioning'
            ? 4600
            : 6200,
      shimmer:
        renderState.emotionalPreset === 'emergent'
          ? 'present'
          : renderState.emotionalPreset === 'reflective'
            ? 'soft'
            : 'off',
      transitionMs: renderState.transitionState === 'stable' ? 360 : 640,
    },
    palette,
    environment: {
      backgroundField:
        renderState.presenceMode === 'active'
          ? 'attuned'
          : renderState.presenceMode === 'transitioning'
            ? 'breathing'
            : 'still',
      particleDensity:
        renderState.presencePercent >= 70
          ? 'soft'
          : renderState.presencePercent >= 42
            ? 'low'
            : 'none',
      focusVignette: renderState.emotionalPreset === 'reflective' ? 'present' : 'soft',
    },
  };
}
