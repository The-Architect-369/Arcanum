import type { HopeState } from '@/lib/hope/context';

export type HopeEmotionalPreset = 'steady' | 'emergent' | 'reflective';
export type HopePresenceMode = 'quiet' | 'active' | 'transitioning';
export type HopeReflectionDensity = 'sparse' | 'gathering' | 'settled';
export type HopeRecencyBand = 'now' | 'recent' | 'distant';
export type HopeDialogueState = 'listening' | 'responding' | 'resting';
export type HopeTransitionState = 'stable' | 'entering' | 'leaving' | 'shifting';
export type HopeTrustState = 'trusted' | 'untrusted';

export type HopeRenderState = {
  presencePercent: number;
  emotionalPreset: HopeEmotionalPreset;
  presenceMode: HopePresenceMode;
  trustState: HopeTrustState;
  reflectionDensity: HopeReflectionDensity;
  recencyBand: HopeRecencyBand;
  dialogueState: HopeDialogueState;
  transitionState: HopeTransitionState;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getHoursSince(timestamp: string | null | undefined) {
  if (!timestamp) return Number.POSITIVE_INFINITY;
  const value = new Date(timestamp).getTime();
  if (Number.isNaN(value)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (Date.now() - value) / 36e5);
}

export function deriveHopeRenderState(state: HopeState, options: { trusted?: boolean } = {}): HopeRenderState {
  const reflections = state.reflections.length;
  const latestReflection = state.reflections[0] ?? null;
  const hoursSinceLatest = getHoursSince(latestReflection?.createdAt);

  const recencyBand: HopeRecencyBand =
    hoursSinceLatest <= 6 ? 'now' : hoursSinceLatest <= 72 ? 'recent' : 'distant';

  const reflectionDensity: HopeReflectionDensity =
    reflections >= 9 ? 'settled' : reflections >= 3 ? 'gathering' : 'sparse';

  const continuityBase = reflections > 0 ? 10 : 0;
  const densityWeight = reflectionDensity === 'settled' ? 14 : reflectionDensity === 'gathering' ? 8 : 0;
  const recencyWeight = recencyBand === 'now' ? 24 : recencyBand === 'recent' ? 12 : 0;
  const trustWeight = options.trusted ? 6 : 0;
  const presencePercent = clamp(32 + continuityBase + densityWeight + recencyWeight + trustWeight, 24, 88);

  const emotionalPreset: HopeEmotionalPreset =
    reflectionDensity === 'settled'
      ? 'reflective'
      : recencyBand === 'now'
        ? 'emergent'
        : 'steady';

  const presenceMode: HopePresenceMode =
    recencyBand === 'now'
      ? 'active'
      : reflectionDensity === 'sparse'
        ? 'quiet'
        : 'transitioning';

  const dialogueState: HopeDialogueState =
    recencyBand === 'now' ? 'responding' : reflections > 0 ? 'listening' : 'resting';

  const transitionState: HopeTransitionState =
    recencyBand === 'now'
      ? 'shifting'
      : reflectionDensity === 'gathering'
        ? 'entering'
        : reflectionDensity === 'settled'
          ? 'leaving'
          : 'stable';

  return {
    presencePercent,
    emotionalPreset,
    presenceMode,
    trustState: options.trusted ? 'trusted' : 'untrusted',
    reflectionDensity,
    recencyBand,
    dialogueState,
    transitionState,
  };
}
