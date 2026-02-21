export type PlanetaryDay =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn';

/**
 * JS Date.getDay(): 0=Sunday ... 6=Saturday
 * Your spec: Monday=Moon day, Tuesday=Mars, etc.
 */
const MAP: PlanetaryDay[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export function getPlanetaryDay(localDate: Date): PlanetaryDay {
  return MAP[localDate.getDay()];
}