'use client';

import { useEffect, useMemo, useState } from 'react';
import { computeWindowState, type WindowState } from '@/lib/tempus/window';
import type { PlanetaryDay } from '@/lib/tempus/planetary';
import type { LunarPhase } from '@/lib/tempus/lunar';
import type { ZodiacSign } from '@/lib/tempus/zodiac';

const PLANETARY: Record<PlanetaryDay, { glyph: string; tone: string; posture: string; color: string }> = {
  Sun: { glyph: '☉', tone: 'Vitality', posture: 'Create, clarify, bless.', color: 'Gold' },
  Moon: { glyph: '☾', tone: 'Reflection', posture: 'Receive, remember, soften.', color: 'Silver' },
  Mars: { glyph: '♂', tone: 'Courage', posture: 'Act, protect, sever cleanly.', color: 'Red' },
  Mercury: { glyph: '☿', tone: 'Signal', posture: 'Name, translate, exchange.', color: 'Quicksilver' },
  Jupiter: { glyph: '♃', tone: 'Expansion', posture: 'Teach, widen, offer.', color: 'Blue' },
  Venus: { glyph: '♀', tone: 'Harmony', posture: 'Beautify, relate, reconcile.', color: 'Rose / Emerald' },
  Saturn: { glyph: '♄', tone: 'Structure', posture: 'Contain, discipline, endure.', color: 'Lead / Black' },
};

const ZODIAC: Record<ZodiacSign, { glyph: string; element: string; mode: string; phrase: string }> = {
  ARIES: { glyph: '♈', element: 'Fire', mode: 'Cardinal', phrase: 'Ignition and first motion.' },
  TAURUS: { glyph: '♉', element: 'Earth', mode: 'Fixed', phrase: 'Embodiment and stewardship.' },
  GEMINI: { glyph: '♊', element: 'Air', mode: 'Mutable', phrase: 'Exchange and branching signal.' },
  CANCER: { glyph: '♋', element: 'Water', mode: 'Cardinal', phrase: 'Shelter and emotional tide.' },
  LEO: { glyph: '♌', element: 'Fire', mode: 'Fixed', phrase: 'Radiance and sovereign heart.' },
  VIRGO: { glyph: '♍', element: 'Earth', mode: 'Mutable', phrase: 'Refinement and sacred method.' },
  LIBRA: { glyph: '♎', element: 'Air', mode: 'Cardinal', phrase: 'Balance and right relation.' },
  SCORPIO: { glyph: '♏', element: 'Water', mode: 'Fixed', phrase: 'Depth, secrecy, transformation.' },
  SAGITTARIUS: { glyph: '♐', element: 'Fire', mode: 'Mutable', phrase: 'Quest, doctrine, horizon.' },
  CAPRICORN: { glyph: '♑', element: 'Earth', mode: 'Cardinal', phrase: 'Ascent, time, responsibility.' },
  AQUARIUS: { glyph: '♒', element: 'Air', mode: 'Fixed', phrase: 'Network, future, liberation.' },
  PISCES: { glyph: '♓', element: 'Water', mode: 'Mutable', phrase: 'Dream, mercy, dissolution.' },
};

const LUNAR: Record<LunarPhase, { glyph: string; posture: string }> = {
  'New Moon': { glyph: '●', posture: 'Seed quietly.' },
  'Waxing Crescent': { glyph: '☽', posture: 'Protect the beginning.' },
  'First Quarter': { glyph: '◐', posture: 'Choose and commit.' },
  'Waxing Gibbous': { glyph: '◖', posture: 'Refine the offering.' },
  'Full Moon': { glyph: '○', posture: 'Reveal and witness.' },
  'Waning Gibbous': { glyph: '◗', posture: 'Share the harvest.' },
  'Third Quarter': { glyph: '◑', posture: 'Release and correct.' },
  'Waning Crescent': { glyph: '☾', posture: 'Rest and dissolve.' },
};

const ZODIAC_ORDER: ZodiacSign[] = [
  'ARIES',
  'TAURUS',
  'GEMINI',
  'CANCER',
  'LEO',
  'VIRGO',
  'LIBRA',
  'SCORPIO',
  'SAGITTARIUS',
  'CAPRICORN',
  'AQUARIUS',
  'PISCES',
];

const PLANETARY_ORDER: PlanetaryDay[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const SIGN_CUSPS: Array<{ sign: ZodiacSign; month: number; day: number }> = [
  { sign: 'ARIES', month: 3, day: 20 },
  { sign: 'TAURUS', month: 4, day: 20 },
  { sign: 'GEMINI', month: 5, day: 21 },
  { sign: 'CANCER', month: 6, day: 21 },
  { sign: 'LEO', month: 7, day: 23 },
  { sign: 'VIRGO', month: 8, day: 23 },
  { sign: 'LIBRA', month: 9, day: 23 },
  { sign: 'SCORPIO', month: 10, day: 23 },
  { sign: 'SAGITTARIUS', month: 11, day: 22 },
  { sign: 'CAPRICORN', month: 12, day: 22 },
  { sign: 'AQUARIUS', month: 1, day: 20 },
  { sign: 'PISCES', month: 2, day: 19 },
];

const MS_PER_DAY = 86_400_000;

function titleCaseSign(sign: ZodiacSign) {
  return sign.charAt(0) + sign.slice(1).toLowerCase();
}

function phaseText(phase: WindowState['phase']) {
  return phase === 'open' ? 'Open' : phase === 'rest' ? 'Resting' : 'Silent';
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function cuspDate(sign: ZodiacSign, year: number) {
  const cusp = SIGN_CUSPS.find((c) => c.sign === sign)!;
  return new Date(year, cusp.month - 1, cusp.day, 0, 0, 0, 0);
}

function seasonFor(sign: ZodiacSign, year: number) {
  const index = ZODIAC_ORDER.indexOf(sign);
  const next = ZODIAC_ORDER[(index + 1) % ZODIAC_ORDER.length];
  const start = cuspDate(sign, year);
  let end = cuspDate(next, year);
  if (end <= start) end = cuspDate(next, year + 1);
  return { start, end };
}

function currentSeason(date: Date) {
  const state = computeWindowState(date);
  const year = state.zodiacSign === 'CAPRICORN' && date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();
  return { sign: state.zodiacSign, ...seasonFor(state.zodiacSign, year) };
}

function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY);
}

function positionOnCircle(angleDeg: number, radiusPct: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    left: `${50 + Math.cos(rad) * radiusPct}%`,
    top: `${50 + Math.sin(rad) * radiusPct}%`,
  };
}

function planetaryHourFor(date: Date) {
  const state = computeWindowState(date);
  const dayIndex = PLANETARY_ORDER.indexOf(state.planetaryDay);
  const hour = date.getHours();
  return PLANETARY_ORDER[(dayIndex + hour) % PLANETARY_ORDER.length];
}

export function TempusClockFace() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const w = useMemo(() => computeWindowState(now), [now]);
  const planetary = PLANETARY[w.planetaryDay];
  const zodiac = ZODIAC[w.zodiacSign];
  const lunar = LUNAR[w.lunarPhase];
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const dayProgress = (hours * 3600 + minutes * 60 + seconds) / 86_400;
  const earthAngle = dayProgress * 360;
  const moonAngle = ((ZODIAC_ORDER.indexOf(w.moonZodiac) / 12) * 360 + (seconds / 60) * 8) % 360;
  const lunarPhaseIndex = Object.keys(LUNAR).indexOf(w.lunarPhase);
  const moonPhaseAngle = (lunarPhaseIndex / 8) * 360;
  const planetaryHour = planetaryHourFor(now);
  const planetaryHourIndex = PLANETARY_ORDER.indexOf(planetaryHour);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="relative mx-auto aspect-square max-w-[21rem] rounded-full border border-white/15 bg-[radial-gradient(circle_at_50%_50%,rgba(246,196,83,.24),transparent_16%),radial-gradient(circle_at_50%_50%,rgba(120,180,255,.12),transparent_48%),rgba(0,0,0,.34)] shadow-[inset_0_0_46px_rgba(120,180,255,.12),0_0_28px_rgba(246,196,83,.08)]">
          <div className="absolute inset-3 rounded-full border border-amber-200/20" />
          <div className="absolute inset-10 rounded-full border border-sky-200/15" />
          <div className="absolute inset-[32%] rounded-full border border-white/10" />

          {ZODIAC_ORDER.map((sign, index) => {
            const z = ZODIAC[sign];
            const active = sign === w.zodiacSign;
            const pos = positionOnCircle(index * 30, 43);
            return (
              <div
                key={sign}
                className={`absolute -translate-x-1/2 -translate-y-1/2 text-center ${active ? 'text-amber-200 drop-shadow-[0_0_12px_rgba(246,196,83,.7)]' : 'text-zinc-400'}`}
                style={pos}
                title={titleCaseSign(sign)}
              >
                <div className="text-base leading-none">{z.glyph}</div>
                <div className="mt-0.5 text-[8px] uppercase tracking-wide opacity-70">{titleCaseSign(sign).slice(0, 3)}</div>
              </div>
            );
          })}

          {PLANETARY_ORDER.map((day, index) => {
            const p = PLANETARY[day];
            const active = day === planetaryHour;
            const pos = positionOnCircle(index * (360 / 7), 27);
            return (
              <div
                key={day}
                className={`absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-sm ${active ? 'border-sky-200/70 bg-sky-300/15 text-sky-100 shadow-[0_0_14px_rgba(125,190,255,.35)]' : 'border-white/10 bg-black/25 text-zinc-400'}`}
                style={pos}
                title={`${day} hour`}
              >
                {p.glyph}
              </div>
            );
          })}

          <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-amber-200/30 bg-amber-200/10 text-center shadow-[0_0_26px_rgba(246,196,83,.32)]">
            <div>
              <div className="text-3xl text-amber-100">☉</div>
              <div className="text-[8px] uppercase tracking-[0.18em] text-amber-100/80">Sun</div>
            </div>
          </div>

          <div
            className="absolute left-1/2 top-1/2 h-[37%] w-px origin-bottom rounded-full bg-amber-100/80 shadow-[0_0_12px_rgba(246,196,83,.6)]"
            style={{ transform: `translate(-50%, -100%) rotate(${earthAngle}deg)` }}
          />

          <div
            className="absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/50 bg-[radial-gradient(circle_at_35%_35%,rgba(125,190,255,.55),rgba(20,40,80,.82))] shadow-[0_0_18px_rgba(125,190,255,.42)]"
            style={positionOnCircle(earthAngle, 37)}
            title="Earth / day position"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-black/35 to-black/70" />
            <div className="absolute left-1/2 top-1/2 h-14 w-px origin-bottom rounded-full bg-white/35" style={{ transform: `translate(-50%, -100%) rotate(${(hours % 24) * 15}deg)` }} />
            <div
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-zinc-100 text-[8px] text-black shadow-[0_0_10px_rgba(255,255,255,.4)]"
              style={positionOnCircle(moonAngle, 82)}
              title={`${w.lunarPhase} moon`}
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-black/10" style={{ transform: `rotate(${moonPhaseAngle}deg)` }}>
                {lunar.glyph}
              </div>
            </div>
          </div>

          <div className="absolute inset-x-10 bottom-8 h-1.5 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-300 via-amber-200 to-violet-300" style={{ width: `${Math.round(dayProgress * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <TempusReading label="Planetary Day" value={`${planetary.glyph} ${w.planetaryDay}`} detail={`${planetary.tone} · ${planetary.posture}`} />
        <TempusReading label="Planetary Hour" value={`${PLANETARY[planetaryHour].glyph} ${planetaryHour}`} detail="Approximate local-hour ruler for the current pass." />
        <TempusReading label="Solar / Earth Position" value={phaseText(w.phase)} detail={w.isDay ? 'Earth is in the daylight half of the dial.' : 'Earth is in the rest half of the dial.'} />
        <TempusReading label="Zodiac Season" value={`${zodiac.glyph} ${titleCaseSign(w.zodiacSign)}`} detail={`${zodiac.element} · ${zodiac.mode} · Day ${w.zodiacDay}`} />
        <TempusReading label="Lunar Current" value={`${lunar.glyph} ${w.lunarPhase}`} detail={`${titleCaseSign(w.moonZodiac)} moon · ${lunar.posture}`} />
      </div>
    </div>
  );
}

export function TempusMonthGrid() {
  const [cursorSign, setCursorSign] = useState<ZodiacSign>(() => computeWindowState(new Date()).zodiacSign);
  const [cursorYear, setCursorYear] = useState(() => new Date().getFullYear());
  const today = useMemo(() => new Date(), []);

  const season = useMemo(() => seasonFor(cursorSign, cursorYear), [cursorSign, cursorYear]);
  const cells = useMemo(() => {
    const totalDays = daysBetween(season.start, season.end);
    return Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(season.start);
      date.setDate(season.start.getDate() + index);
      return { date, state: computeWindowState(date), seasonDay: index + 1 };
    });
  }, [season]);

  const activeZodiac = ZODIAC[cursorSign];
  const seasonLabel = `${titleCaseSign(cursorSign)} Season`;
  const dateRange = `${season.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — ${new Date(season.end.getTime() - MS_PER_DAY).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const moveSeason = (delta: number) => {
    const currentIndex = ZODIAC_ORDER.indexOf(cursorSign);
    const nextIndex = currentIndex + delta;
    const wrapped = ((nextIndex % ZODIAC_ORDER.length) + ZODIAC_ORDER.length) % ZODIAC_ORDER.length;
    const yearDelta = nextIndex < 0 ? -1 : nextIndex >= ZODIAC_ORDER.length ? 1 : 0;
    setCursorSign(ZODIAC_ORDER[wrapped]);
    setCursorYear((year) => year + yearDelta);
  };

  const returnToCurrentSeason = () => {
    const current = currentSeason(new Date());
    setCursorSign(current.sign);
    setCursorYear(current.start.getFullYear());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => moveSeason(-1)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200">Prev</button>
        <div className="text-center">
          <div className="text-2xl text-amber-200 drop-shadow-[0_0_10px_rgba(246,196,83,.45)]">{activeZodiac.glyph}</div>
          <div className="text-base font-semibold text-zinc-100">{seasonLabel}</div>
          <div className="text-[11px] text-zinc-400">{dateRange}</div>
          <button onClick={returnToCurrentSeason} className="mt-1 text-[11px] uppercase tracking-[0.18em] text-amber-200/90">Return to current season</button>
        </div>
        <button onClick={() => moveSeason(1)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200">Next</button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-zinc-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: season.start.getDay() }, (_, i) => <div key={`pad-${i}`} />)}
          {cells.map(({ date, state, seasonDay }) => {
            const planetary = PLANETARY[state.planetaryDay];
            const lunar = LUNAR[state.lunarPhase];
            const active = sameDay(date, today);
            return (
              <div
                key={date.toISOString()}
                className={`min-h-[4.9rem] rounded-2xl border p-2 text-left transition ${active ? 'border-amber-300/70 bg-amber-300/10 shadow-[0_0_16px_rgba(246,196,83,.22)]' : 'border-white/10 bg-black/20'}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] text-zinc-500">{date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}</span>
                  <span className="text-sm text-amber-200">{planetary.glyph}</span>
                </div>
                <div className="mt-1 text-xs text-zinc-100">Day {seasonDay}</div>
                <div className="mt-1 truncate text-[10px] text-sky-200">{date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <div className="mt-1 truncate text-[10px] text-zinc-400">{lunar.glyph} {state.lunarPhase.replace(' Moon', '')}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-xs text-zinc-300">
        <span className="text-amber-200">{activeZodiac.element} · {activeZodiac.mode}</span> — {activeZodiac.phrase}
      </div>
    </div>
  );
}

export function TempusCodexLibrary({ current }: { current: WindowState }) {
  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <SectionTitle title="Planetary Week" detail="Daily tone without obligation." />
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(PLANETARY) as PlanetaryDay[]).map((day) => {
            const p = PLANETARY[day];
            const active = current.planetaryDay === day;
            return <CodexCard key={day} active={active} glyph={p.glyph} title={day} meta={`${p.tone} · ${p.color}`} body={p.posture} />;
          })}
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle title="Zodiac Wheel" detail="Season-sign correspondence map." />
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(ZODIAC) as ZodiacSign[]).map((sign) => {
            const z = ZODIAC[sign];
            const active = current.zodiacSign === sign;
            return <CodexCard key={sign} active={active} glyph={z.glyph} title={titleCaseSign(sign)} meta={`${z.element} · ${z.mode}`} body={z.phrase} />;
          })}
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle title="Lunar Cycle" detail="Eight-step phase posture." />
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(LUNAR) as LunarPhase[]).map((phase) => {
            const l = LUNAR[phase];
            const active = current.lunarPhase === phase;
            return <CodexCard key={phase} active={active} glyph={l.glyph} title={phase} meta="Lunar posture" body={l.posture} />;
          })}
        </div>
      </section>
    </div>
  );
}

function TempusReading({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-zinc-100">{value}</div>
      <div className="mt-1 text-xs text-zinc-400">{detail}</div>
    </div>
  );
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      <div className="text-right text-[11px] text-zinc-500">{detail}</div>
    </div>
  );
}

function CodexCard({ active, glyph, title, meta, body }: { active: boolean; glyph: string; title: string; meta: string; body: string }) {
  return (
    <div className={`rounded-2xl border p-3 ${active ? 'border-amber-300/60 bg-amber-300/10 shadow-[0_0_18px_rgba(246,196,83,.18)]' : 'border-white/10 bg-white/[0.035]'}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-black/30 text-lg text-amber-200">{glyph}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-100">{title}</div>
          <div className="text-xs text-sky-200/80">{meta}</div>
          <p className="mt-1 text-xs text-zinc-400">{body}</p>
        </div>
      </div>
    </div>
  );
}
