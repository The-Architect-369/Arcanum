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
  const dayProgress = (hours * 60 + minutes) / 1440;
  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="relative mx-auto aspect-square max-w-[18rem] rounded-full border border-white/15 bg-[radial-gradient(circle_at_50%_42%,rgba(246,196,83,.18),transparent_34%),radial-gradient(circle_at_50%_72%,rgba(120,180,255,.12),transparent_36%),rgba(0,0,0,.32)] shadow-[inset_0_0_42px_rgba(120,180,255,.12),0_0_28px_rgba(246,196,83,.08)]">
          <div className="absolute inset-4 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-2 -translate-x-1/2 text-xs text-amber-200">☉</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-sky-200">☾</div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-300">Rest</div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-300">Open</div>

          <div
            className="absolute left-1/2 top-1/2 h-[43%] w-px origin-bottom rounded-full bg-amber-200 shadow-[0_0_10px_rgba(246,196,83,.7)]"
            style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[36%] w-px origin-bottom rounded-full bg-sky-200/90 shadow-[0_0_10px_rgba(125,190,255,.55)]"
            style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)` }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[40%] w-[1px] origin-bottom rounded-full bg-white/70"
            style={{ transform: `translate(-50%, -100%) rotate(${secondAngle}deg)` }}
          />

          <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/45 text-center backdrop-blur-md">
            <div>
              <div className="text-3xl text-amber-200 drop-shadow-[0_0_14px_rgba(246,196,83,.55)]">{planetary.glyph}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-300">{phaseText(w.phase)}</div>
            </div>
          </div>

          <div className="absolute inset-x-8 bottom-8 h-1.5 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-300 via-amber-200 to-violet-300" style={{ width: `${Math.round(dayProgress * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <TempusReading label="Planetary Day" value={`${planetary.glyph} ${w.planetaryDay}`} detail={`${planetary.tone} · ${planetary.posture}`} />
        <TempusReading label="Solar Window" value={phaseText(w.phase)} detail={w.isDay ? 'Daylight window: available action.' : 'Night window: rest and integration.'} />
        <TempusReading label="Zodiac Month" value={`${zodiac.glyph} ${titleCaseSign(w.zodiacSign)}`} detail={`${zodiac.element} · ${zodiac.mode} · Day ${w.zodiacDay}`} />
        <TempusReading label="Lunar Current" value={`${lunar.glyph} ${w.lunarPhase}`} detail={`${titleCaseSign(w.moonZodiac)} moon · ${lunar.posture}`} />
      </div>
    </div>
  );
}

export function TempusMonthGrid() {
  const [cursor, setCursor] = useState(() => new Date());
  const today = useMemo(() => new Date(), []);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { date, state: computeWindowState(date), inMonth: date.getMonth() === cursor.getMonth() };
    });
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const moveMonth = (delta: number) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => moveMonth(-1)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200">Prev</button>
        <div className="text-center">
          <div className="text-base font-semibold text-zinc-100">{monthLabel}</div>
          <button onClick={() => setCursor(new Date())} className="mt-1 text-[11px] uppercase tracking-[0.18em] text-amber-200/90">Return to today</button>
        </div>
        <button onClick={() => moveMonth(1)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200">Next</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-zinc-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map(({ date, state, inMonth }) => {
          const planetary = PLANETARY[state.planetaryDay];
          const zodiac = ZODIAC[state.zodiacSign];
          const lunar = LUNAR[state.lunarPhase];
          const active = sameDay(date, today);
          return (
            <div
              key={date.toISOString()}
              className={`min-h-[4.4rem] rounded-2xl border p-2 text-left transition ${active ? 'border-amber-300/70 bg-amber-300/10 shadow-[0_0_16px_rgba(246,196,83,.22)]' : 'border-white/10 bg-white/[0.035]'} ${inMonth ? 'opacity-100' : 'opacity-35'}`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs text-zinc-200">{date.getDate()}</span>
                <span className="text-sm text-amber-200">{planetary.glyph}</span>
              </div>
              <div className="mt-2 truncate text-[10px] text-sky-200">{zodiac.glyph} {titleCaseSign(state.zodiacSign).slice(0, 3)}</div>
              <div className="mt-1 truncate text-[10px] text-zinc-400">{lunar.glyph} {state.lunarPhase.replace(' Moon', '')}</div>
            </div>
          );
        })}
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
        <SectionTitle title="Zodiac Wheel" detail="Month-sign correspondence map." />
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
