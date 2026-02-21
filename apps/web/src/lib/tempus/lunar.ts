import { SYNODIC_MONTH_DAYS } from './constants';
import type { ZodiacSign } from './zodiac';

export type LunarPhase =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Third Quarter'
  | 'Waning Crescent';

const PHASES: LunarPhase[] = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Third Quarter',
  'Waning Crescent',
];

const ZODIAC: ZodiacSign[] = [
  'ARIES','TAURUS','GEMINI','CANCER',
  'LEO','VIRGO','LIBRA','SCORPIO',
  'SAGITTARIUS','CAPRICORN','AQUARIUS','PISCES'
];

// Ported from PlanetaryDialManager.cs (UTC).
const NEW_MOONS_2025: Date[] = [
  new Date(Date.UTC(2025, 0, 11, 16, 57, 0)),
  new Date(Date.UTC(2025, 1, 10, 10, 12, 0)),
  new Date(Date.UTC(2025, 2, 11,  2,  4, 0)),
  new Date(Date.UTC(2025, 3,  9, 18, 31, 0)),
  new Date(Date.UTC(2025, 4,  9,  9, 41, 0)),
  new Date(Date.UTC(2025, 5, 25,  2, 40, 0)),
  new Date(Date.UTC(2025, 6,  8,  7, 58, 0)),
  new Date(Date.UTC(2025, 7,  6, 20, 53, 0)),
  new Date(Date.UTC(2025, 8,  5, 10, 54, 0)),
  new Date(Date.UTC(2025, 9,  5,  0, 31, 0)),
  new Date(Date.UTC(2025,10,  3, 14, 42, 0)),
  new Date(Date.UTC(2025,11,  3,  4, 32, 0)),
];
const NEW_MOON_ZODIAC_2025: number[] = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7];

const NEW_MOONS_2026: Date[] = [
  new Date(Date.UTC(2026, 0, 18, 12, 53, 17)),
  new Date(Date.UTC(2026, 1, 17,  5,  3,  5)),
  new Date(Date.UTC(2026, 2, 18, 18, 26,  1)),
  new Date(Date.UTC(2026, 3, 17,  4, 54, 18)),
  new Date(Date.UTC(2026, 4, 16, 13,  3,  7)),
  new Date(Date.UTC(2026, 5, 14, 19, 56,  0)),
  new Date(Date.UTC(2026, 6, 14,  2, 45,  7)),
  new Date(Date.UTC(2026, 7, 12, 10, 37, 37)),
  new Date(Date.UTC(2026, 8, 10, 20, 27, 18)),
  new Date(Date.UTC(2026, 9, 10,  8, 50, 11)),
  new Date(Date.UTC(2026,10,  9,  0,  2, 30)),
  new Date(Date.UTC(2026,11,  8, 17, 52, 49)),
];
const NEW_MOON_ZODIAC_2026: number[] = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6];

const MS_PER_DAY = 86400 * 1000;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getTables(year: number) {
  if (year === 2026) return { moons: NEW_MOONS_2026, zodiacs: NEW_MOON_ZODIAC_2026 };
  return { moons: NEW_MOONS_2025, zodiacs: NEW_MOON_ZODIAC_2025 };
}

export function getLunarState(utcNow: Date): {
  phase: LunarPhase;
  phaseIndex: number; // 0..7
  moonZodiac: ZodiacSign;
  moonZodiacIndex: number; // 0..11
  daysSinceNewMoon: number;
} {
  const year = utcNow.getUTCFullYear();
  const { moons, zodiacs } = getTables(year);

  let lastIdx = 0;
  for (let i = 1; i < moons.length; i++) {
    if (utcNow >= moons[i]) lastIdx = i;
  }

  const lastNewMoon = moons[lastIdx];
  const daysSince = (utcNow.getTime() - lastNewMoon.getTime()) / MS_PER_DAY;

  // Moon zodiac: discrete jumps, 2.5 days per sign (Unity)
  const signSteps = Math.floor(daysSince / 2.5);
  const startZodiac = zodiacs[lastIdx];
  const currentZodiac = mod(startZodiac + signSteps, 12);

  // Lunar phase: true phase (synodic month), 8 steps
  const phaseFrac = mod(daysSince / SYNODIC_MONTH_DAYS, 1);
  const phaseIndex = clamp(Math.floor(phaseFrac * 8), 0, 7);

  return {
    phase: PHASES[phaseIndex],
    phaseIndex,
    moonZodiac: ZODIAC[currentZodiac],
    moonZodiacIndex: currentZodiac,
    daysSinceNewMoon: daysSince,
  };
}