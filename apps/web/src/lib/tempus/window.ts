import { DEFAULT_SUNRISE_HOUR, DEFAULT_SUNSET_HOUR } from './constants';
import { getPlanetaryDay } from './planetary';
import { getZodiacSign } from './zodiac';
import { getLunarState } from './lunar';

export type WindowPhase = 'open' | 'rest' | 'silent';

export interface WindowConfig {
  sunriseHour?: number; // local hour
  sunsetHour?: number;  // local hour
  silent?: boolean;     // reserved
}

export interface WindowState {
  phase: WindowPhase;
  planetaryDay: ReturnType<typeof getPlanetaryDay>;
  isDay: boolean;
  zodiacSign: ReturnType<typeof getZodiacSign>['sign'];
  zodiacDay: number;
  lunarPhase: ReturnType<typeof getLunarState>['phase'];
  moonZodiac: ReturnType<typeof getLunarState>['moonZodiac'];
}

export function computeWindowState(nowLocal: Date, config: WindowConfig = {}): WindowState {
  const sunrise = config.sunriseHour ?? DEFAULT_SUNRISE_HOUR;
  const sunset = config.sunsetHour ?? DEFAULT_SUNSET_HOUR;

  const hour = nowLocal.getHours() + nowLocal.getMinutes() / 60;
  const isDay = hour >= sunrise && hour < sunset;

  const phase: WindowPhase = config.silent ? 'silent' : (isDay ? 'open' : 'rest');

  const planetaryDay = getPlanetaryDay(nowLocal);
  const { sign: zodiacSign, dayOfSign: zodiacDay } = getZodiacSign(nowLocal);

  // Lunar uses UTC tables internally
  const lunar = getLunarState(new Date());

  return {
    phase,
    planetaryDay,
    isDay,
    zodiacSign,
    zodiacDay,
    lunarPhase: lunar.phase,
    moonZodiac: lunar.moonZodiac,
  };
}