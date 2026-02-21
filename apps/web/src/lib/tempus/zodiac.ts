export type ZodiacSign =
  | 'ARIES' | 'TAURUS' | 'GEMINI' | 'CANCER'
  | 'LEO' | 'VIRGO' | 'LIBRA' | 'SCORPIO'
  | 'SAGITTARIUS' | 'CAPRICORN' | 'AQUARIUS' | 'PISCES';

const SIGNS: ZodiacSign[] = [
  'ARIES','TAURUS','GEMINI','CANCER',
  'LEO','VIRGO','LIBRA','SCORPIO',
  'SAGITTARIUS','CAPRICORN','AQUARIUS','PISCES'
];

/**
 * Hybrid MVP cusp table — directly ported from TimeDialManager.cs signCusps.
 * Seam to replace with real solar-ingress ephemeris later.
 */
const SIGN_CUSPS: Array<{ signIndex: number; month: number; day: number }> = [
  { signIndex: 0,  month: 3,  day: 20 }, // ARIES
  { signIndex: 1,  month: 4,  day: 20 }, // TAURUS
  { signIndex: 2,  month: 5,  day: 21 }, // GEMINI
  { signIndex: 3,  month: 6,  day: 21 }, // CANCER
  { signIndex: 4,  month: 7,  day: 23 }, // LEO
  { signIndex: 5,  month: 8,  day: 23 }, // VIRGO
  { signIndex: 6,  month: 9,  day: 23 }, // LIBRA
  { signIndex: 7,  month: 10, day: 23 }, // SCORPIO
  { signIndex: 8,  month: 11, day: 22 }, // SAGITTARIUS
  { signIndex: 9,  month: 12, day: 22 }, // CAPRICORN
  { signIndex: 10, month: 1,  day: 20 }, // AQUARIUS
  { signIndex: 11, month: 2,  day: 19 }, // PISCES
];

const MS_PER_DAY = 86400 * 1000;

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildCuspDates(year: number): Date[] {
  return SIGN_CUSPS.map(c => new Date(year, c.month - 1, c.day, 0, 0, 0, 0));
}

export function getZodiacSign(localDate: Date): { sign: ZodiacSign; dayOfSign: number } {
  const year = localDate.getFullYear();
  const cuspDates = buildCuspDates(year);

  // pick the most recent cusp ≤ now (Unity logic)
  let chosenSignIndex = 9; // default: Capricorn
  let chosenCusp = cuspDates[9];
  let found = false;

  for (const dt of cuspDates) {
    if (localDate < dt) break;

    const match = SIGN_CUSPS.find(c => (c.month - 1) === dt.getMonth() && c.day === dt.getDate());
    if (match) {
      chosenSignIndex = match.signIndex;
      chosenCusp = dt;
      found = true;
    }
  }

  if (!found) {
    // before Jan 20: Capricorn of previous year (Unity logic)
    chosenSignIndex = 9;
    chosenCusp = new Date(year - 1, 11, 22, 0, 0, 0, 0);
  }

  const dayOfSign =
    Math.floor((stripTime(localDate).getTime() - stripTime(chosenCusp).getTime()) / MS_PER_DAY) + 1;

  return { sign: SIGNS[chosenSignIndex], dayOfSign };
}