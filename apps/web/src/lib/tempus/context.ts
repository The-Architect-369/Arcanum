import { computeWindowState } from './window';
import type { PlanetaryDay } from './planetary';
import type { LunarPhase } from './lunar';
import type { ZodiacSign } from './zodiac';

export type TempusLayer =
  | 'calendar'
  | 'solar'
  | 'lunar'
  | 'zodiac_planetary'
  | 'decanic'
  | 'ceremonial'
  | 'rite'
  | 'utility';

export type TempusDepth =
  | 'grounded'
  | 'seasonal'
  | 'lunar'
  | 'celestial'
  | 'decanic'
  | 'ceremonial';

export type SolarSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export type TempusContext = {
  version: 'tempus.context.v0.1';
  capturedAt: string;
  timezoneOffsetMinutes: number;
  phase: 'open' | 'rest' | 'silent';
  isDay: boolean;
  solar: {
    season: SolarSeason;
    isEquinox?: boolean;
    isSolstice?: boolean;
  };
  lunar: {
    phase: LunarPhase;
    moonZodiac: ZodiacSign;
  };
  zodiac: {
    sign: ZodiacSign;
    dayOfSign: number;
  };
  planetary: {
    day: PlanetaryDay;
    hour?: PlanetaryDay;
  };
  layers: {
    active: TempusLayer[];
    depth: TempusDepth;
  };
  precision: 'mvp-table' | 'ephemeris';
  source: 'local-device';
  interpretation: null;
};

export type TempusRiteRecord = {
  id: string;
  riteId: string;
  title: string;
  recordedAt: string;
  context: TempusContext;
  notes?: string;
  receiptStatus: 'local_only' | 'queued' | 'anchored';
  rewardMode: 'none' | 'rites_eligible';
  interpretation: null;
};

const PLANETARY_ORDER: PlanetaryDay[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export const TEMPUS_DEPTH_LAYERS: Record<TempusDepth, TempusLayer[]> = {
  grounded: ['calendar'],
  seasonal: ['calendar', 'solar'],
  lunar: ['calendar', 'solar', 'lunar'],
  celestial: ['calendar', 'solar', 'lunar', 'zodiac_planetary'],
  decanic: ['calendar', 'solar', 'lunar', 'zodiac_planetary', 'decanic'],
  ceremonial: ['calendar', 'solar', 'lunar', 'zodiac_planetary', 'decanic', 'ceremonial'],
};

function cloneLayers(layers: TempusLayer[]) {
  return [...layers];
}

function planetaryHourFor(date: Date, planetaryDay: PlanetaryDay): PlanetaryDay {
  const dayIndex = PLANETARY_ORDER.indexOf(planetaryDay);
  const hour = date.getHours();
  return PLANETARY_ORDER[(dayIndex + hour) % PLANETARY_ORDER.length];
}

function solarSeasonFor(date: Date): TempusContext['solar'] {
  const month = date.getMonth();
  const day = date.getDate();
  const key = `${month + 1}-${day}`;

  if (key === '3-20') return { season: 'spring', isEquinox: true };
  if (key === '6-21') return { season: 'summer', isSolstice: true };
  if (key === '9-22' || key === '9-23') return { season: 'autumn', isEquinox: true };
  if (key === '12-21') return { season: 'winter', isSolstice: true };

  if (month > 2 && month < 5) return { season: 'spring' };
  if (month === 2 && day >= 20) return { season: 'spring' };
  if (month === 5 && day < 21) return { season: 'spring' };

  if (month > 5 && month < 8) return { season: 'summer' };
  if (month === 5 && day >= 21) return { season: 'summer' };
  if (month === 8 && day < 22) return { season: 'summer' };

  if (month > 8 && month < 11) return { season: 'autumn' };
  if (month === 8 && day >= 22) return { season: 'autumn' };
  if (month === 11 && day < 21) return { season: 'autumn' };

  return { season: 'winter' };
}

export function captureTempusContext(
  date = new Date(),
  options: {
    depth?: TempusDepth;
    activeLayers?: TempusLayer[];
  } = {}
): TempusContext {
  const depth = options.depth ?? 'seasonal';
  const windowState = computeWindowState(date);
  const active = options.activeLayers ? cloneLayers(options.activeLayers) : cloneLayers(TEMPUS_DEPTH_LAYERS[depth]);

  return {
    version: 'tempus.context.v0.1',
    capturedAt: date.toISOString(),
    timezoneOffsetMinutes: date.getTimezoneOffset(),
    phase: windowState.phase,
    isDay: windowState.isDay,
    solar: solarSeasonFor(date),
    lunar: {
      phase: windowState.lunarPhase,
      moonZodiac: windowState.moonZodiac,
    },
    zodiac: {
      sign: windowState.zodiacSign,
      dayOfSign: windowState.zodiacDay,
    },
    planetary: {
      day: windowState.planetaryDay,
      hour: active.includes('zodiac_planetary') ? planetaryHourFor(date, windowState.planetaryDay) : undefined,
    },
    layers: {
      active,
      depth,
    },
    precision: 'mvp-table',
    source: 'local-device',
    interpretation: null,
  };
}
