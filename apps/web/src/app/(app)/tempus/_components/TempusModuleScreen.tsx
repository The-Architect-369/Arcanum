'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import AppStage from '@/components/ui/AppStage';
import ModuleMatrixShell from '@/components/ui/ModuleMatrixShell';
import { cn } from '@/lib/cn';
import { useTempusWindow } from '@/hooks/useTempusWindow';

type FamilyId = 'clock' | 'calendar' | 'codex';
type CardId = string;
type FamilyMotion = 'idle' | 'next' | 'prev';

type CardConfig = {
  id: CardId;
  title: string;
  caption: string;
  navLabel: string;
  render: () => React.ReactNode;
};

type FamilyConfig = {
  href: string;
  label: string;
  shellAction: React.ReactNode;
  cards: CardConfig[];
};

const ORDER = ['/tempus/clock', '/tempus/calendar', '/tempus/codex'] as const;
const FAMILY_BY_HREF: Record<(typeof ORDER)[number], FamilyId> = {
  '/tempus/clock': 'clock',
  '/tempus/calendar': 'calendar',
  '/tempus/codex': 'codex',
};
const FAMILY_INDEX: Record<FamilyId, number> = {
  clock: 0,
  calendar: 1,
  codex: 2,
};

function phaseText(phase: 'open' | 'rest' | 'silent') {
  return phase === 'open' ? 'Open' : phase === 'rest' ? 'Resting' : 'Silent';
}

function familyFromPathname(pathname: string): FamilyId | null {
  const clean = pathname.split('?')[0]?.split('#')[0] || '';
  if (clean in FAMILY_BY_HREF) {
    return FAMILY_BY_HREF[clean as keyof typeof FAMILY_BY_HREF];
  }
  return null;
}

function motionForFamilyChange(from: FamilyId, to: FamilyId): FamilyMotion {
  if (from === to) return 'idle';
  return FAMILY_INDEX[to] > FAMILY_INDEX[from] ? 'next' : 'prev';
}

function subtitleFromCardTitle(title: string) {
  return title.replace(/^Tempus\s*-\s*/i, '');
}

export default function TempusModuleScreen({ family }: { family: FamilyId }) {
  const w = useTempusWindow();
  const [activeFamilyId, setActiveFamilyId] = useState<FamilyId>(family);
  const [activeCardId, setActiveCardId] = useState<CardId>('a1');
  const [familyMotion, setFamilyMotion] = useState<FamilyMotion>('idle');
  const [familyMotionKey, setFamilyMotionKey] = useState(0);

  const families = useMemo<Record<FamilyId, FamilyConfig>>(
    () => ({
      clock: {
        href: ORDER[0],
        label: 'Clock',
        shellAction: <div className="text-xs text-zinc-400">A track · present time, active layers, and daily rite</div>,
        cards: [
          {
            id: 'a1',
            navLabel: 'A1',
            title: 'Tempus - A1 Position',
            caption: 'The immediate time readout. This is where the user returns to see where they are in the day, what side of the world they stand on, and what window is active now.',
            render: () => <ClockOverviewCard />,
          },
          {
            id: 'a2',
            navLabel: 'A2',
            title: 'Tempus - A2 Layer Readout',
            caption: 'The daily field. Local conditions, celestial overlays, and the first practical cues of the day gather here before expanding into wider calendars and codices.',
            render: () => <DailyReadoutCard />,
          },
          {
            id: 'a3',
            navLabel: 'A3',
            title: 'Tempus - A3 Daily Rite',
            caption: 'The daily invitation. Tempus should eventually generate rites, prompts, challenges, and reflective actions from the active conditions of the present window.',
            render: () => <RiteCard />,
          },
        ],
      },
      calendar: {
        href: ORDER[1],
        label: 'Calendar',
        shellAction: <div className="text-xs text-zinc-400">B track · familiar calendar, annual spiral, and historical lens</div>,
        cards: [
          {
            id: 'b1',
            navLabel: 'B1',
            title: 'Tempus - B1 Calendar',
            caption: 'The familiar map of time. This is where a user sees the present month first, then gradually understands how celestial overlays and event memory pattern the days.',
            render: () => <CalendarMonthCard />,
          },
          {
            id: 'b2',
            navLabel: 'B2',
            title: 'Tempus - B2 Annual Spiral',
            caption: 'The year as a living field. Presence, rites, and recorded attention should make the spiral glow month by month and allow the user to feel time as a pattern, not just a grid.',
            render: () => <AnnualSpiralCard />,
          },
          {
            id: 'b3',
            navLabel: 'B3',
            title: 'Tempus - B3 Historical Lens',
            caption: 'The wider time horizon. This layer is for history, larger cycles, and celestial perspective beyond the immediate needs of the current day or month.',
            render: () => <HistoricalSkyCard />,
          },
        ],
      },
      codex: {
        href: ORDER[2],
        label: 'Codex',
        shellAction: <div className="text-xs text-zinc-400">C track · fixed correspondences, study, and deeper lookup</div>,
        cards: [
          {
            id: 'c1',
            navLabel: 'C1',
            title: 'Tempus - C1 Seasons',
            caption: 'The first stable correspondence layer. Seasons are the clearest bridge between ordinary timekeeping and the deeper symbolic language of Tempus.',
            render: () => <CodexDomainCard title="Seasons" items={['Spring', 'Summer', 'Autumn', 'Winter']} lockedLabel="Season detail opens upward" />,
          },
          {
            id: 'c2',
            navLabel: 'C2',
            title: 'Tempus - C2 Moon',
            caption: 'The lunar correspondence layer. Phases come first, then reflections, gates, and recurring lunar relations can deepen with study.',
            render: () => <CodexDomainCard title="Moon" items={['Lunar phases', 'Moon reflections', 'Moon gates']} lockedLabel="Deeper lunar knowledge remains gated" />,
          },
          {
            id: 'c3',
            navLabel: 'C3',
            title: 'Tempus - C3 Planets',
            caption: 'The planetary layer. Day tones, practical symbolism, and the wandering lights belong here as part of the fixed lookup spine of the system.',
            render: () => <CodexDomainCard title="Planets" items={['Planetary days', 'Planetary tones', 'Planetary gates']} lockedLabel="Advanced planetary views unlock later" />,
          },
          {
            id: 'c4',
            navLabel: 'C4',
            title: 'Tempus - C4 Zodiac',
            caption: 'The outer correspondence layer. Zodiac and larger archetypal structures should feel like the furthest visible edge of Tempus study before the deepest gates open.',
            render: () => <CodexDomainCard title="Zodiac" items={['Signs', 'Archetypes', 'Zodiac gates']} lockedLabel="Deep zodiac knowledge is still locked" />,
          },
        ],
      },
    }),
    [w]
  );

  const activeFamily = families[activeFamilyId];
  const activeCard = activeFamily.cards.find((card) => card.id === activeCardId) ?? activeFamily.cards[0];
  const verticalTabs = activeFamily.cards.map((card) => ({ id: card.id, label: card.navLabel }));
  const titleSubtitle = subtitleFromCardTitle(activeCard.title);

  useEffect(() => {
    const timer = window.setTimeout(() => setFamilyMotion('idle'), 190);
    return () => window.clearTimeout(timer);
  }, [familyMotionKey]);

  const transitionToFamily = (nextFamily: FamilyId, syncHistory: boolean) => {
    if (nextFamily === activeFamilyId) return;
    const motion = motionForFamilyChange(activeFamilyId, nextFamily);
    if (syncHistory) {
      const href = families[nextFamily].href;
      window.history.replaceState(window.history.state, '', href);
    }
    setFamilyMotion(motion);
    setFamilyMotionKey((value) => value + 1);
    setActiveFamilyId(nextFamily);
  };

  useEffect(() => {
    transitionToFamily(family, false);
  }, [family]);

  useEffect(() => {
    setActiveCardId(activeFamily.cards[0]?.id ?? 'a1');
  }, [activeFamilyId]);

  useEffect(() => {
    const onPopState = () => {
      const nextFamily = familyFromPathname(window.location.pathname);
      if (nextFamily) transitionToFamily(nextFamily, false);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeFamilyId, families]);

  const onHorizontalChange = (href: string) => {
    const nextFamily = familyFromPathname(href);
    if (nextFamily) transitionToFamily(nextFamily, true);
  };

  const swipeStart = React.useRef<{ x: number; y: number } | null>(null);
  const swipeLock = React.useRef<'h' | 'v' | null>(null);

  const onTouchStartCapture = (e: React.TouchEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('[data-no-route-swipe="true"]')) return;
    const t = e.touches[0];
    swipeStart.current = { x: t.clientX, y: t.clientY };
    swipeLock.current = null;
  };

  const onTouchMoveCapture = (e: React.TouchEvent) => {
    if (!swipeStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - swipeStart.current.x;
    const dy = t.clientY - swipeStart.current.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (!swipeLock.current) {
      if (ax >= 12 && ax > ay * 1.06) swipeLock.current = 'h';
      else if (ay >= 12 && ay > ax) swipeLock.current = 'v';
      else return;
    }

    if (swipeLock.current === 'h') {
      e.preventDefault();
    }
  };

  const onTouchEndCapture = (e: React.TouchEvent) => {
    if (!swipeStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeStart.current.x;
    const dy = t.clientY - swipeStart.current.y;
    swipeStart.current = null;

    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ax < 12 || ax <= ay * 1.06) return;

    const currentIndex = ORDER.indexOf(activeFamily.href as (typeof ORDER)[number]);
    if (currentIndex === -1) return;

    const nextIndex = dx < 0 ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= ORDER.length) return;

    const nextFamily = FAMILY_BY_HREF[ORDER[nextIndex]];
    transitionToFamily(nextFamily, true);
  };

  return (
    <AppStage>
      <div className="h-full min-h-0" onTouchStartCapture={onTouchStartCapture} onTouchMoveCapture={onTouchMoveCapture} onTouchEndCapture={onTouchEndCapture}>
        <ModuleMatrixShell
          title={
            <div
              key={`title-${activeFamilyId}-${familyMotionKey}`}
              className={cn(
                'tempus-title-shell flex min-w-0 items-baseline gap-3 sm:gap-4',
                familyMotion === 'next' && 'tempus-title-shell--next',
                familyMotion === 'prev' && 'tempus-title-shell--prev'
              )}
            >
              <span className="tempus-title-word truncate">Tempus</span>
              <span className="tempus-title-subtitle truncate">{titleSubtitle}</span>
            </div>
          }
          actions={activeFamily.shellAction}
          horizontalTabs={Object.values(families).map(({ href, label }) => ({ href, label }))}
          activeHorizontalHref={activeFamily.href}
          onHorizontalChange={onHorizontalChange}
          verticalTabs={verticalTabs}
          activeVerticalId={activeCard.id}
          onVerticalChange={(id) => setActiveCardId(id)}
          className="min-h-0 flex-1"
        >
          <div
            key={`${activeFamilyId}-${familyMotionKey}`}
            className={cn(
              'tempus-family-panel space-y-4',
              familyMotion === 'next' && 'tempus-family-panel--next',
              familyMotion === 'prev' && 'tempus-family-panel--prev'
            )}
          >
            <p className="text-sm text-zinc-300">{activeCard.caption}</p>
            {activeCard.render()}
          </div>
        </ModuleMatrixShell>
      </div>
    </AppStage>
  );
}

function ClockOverviewCard() {
  const w = useTempusWindow();
  const now = new Date();

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Present position</div>
            <h3 className="mt-2 text-base font-semibold text-zinc-100">Grounded time readout</h3>
          </div>
          <div className="text-right text-sm text-zinc-300">
            <div>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-xs text-zinc-500">{now.toLocaleDateString()}</div>
          </div>
        </div>
        <div className="mt-4 rounded-[2rem] border border-white/10 bg-black/20 p-5">
          <div className="mx-auto grid aspect-square max-w-[16rem] place-items-center rounded-full border border-sky-200/25 bg-[radial-gradient(circle_at_35%_30%,rgba(125,190,255,.26),transparent_28%),radial-gradient(circle_at_68%_72%,rgba(246,196,83,.16),transparent_30%),rgba(7,10,20,.88)] shadow-[inset_0_0_42px_rgba(125,190,255,.12)]">
            <div className="grid h-28 w-28 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-center">
              <div>
                <div className="text-4xl">🌍</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-400">{w.isDay ? 'Day side' : 'Night side'}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-300 via-amber-200 to-sky-300" style={{ width: `${Math.round(((now.getHours() * 60 + now.getMinutes()) / 1440) * 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        <StateBlock label="Window phase" value={phaseText(w.phase)} detail={w.isDay ? 'Current local field is on the lit side.' : 'Current local field is on the resting side.'} />
        <StateBlock label="Planetary day" value={w.planetaryDay} detail="Kept readable here so the first Tempus view stays immediate." />
        <StateBlock label="Season signal" value={w.zodiacSign} detail={`Season day ${w.zodiacDay}. Deeper correspondence belongs later in the track.`} />
      </div>
    </div>
  );
}

function DailyReadoutCard() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <StateBlock label="Temperature" value="72°F" detail="Weather integration placeholder for local daily conditions." />
      <StateBlock label="Humidity" value="48%" detail="Atmospheric readout placeholder." />
      <StateBlock label="Wind" value="7 mph" detail="Daily environmental condition placeholder." />
      <StateBlock label="Pressure" value="1014 mb" detail="Atmospheric pressure placeholder." />
      <StateBlock label="Season layer" value="Active" detail="Seasonal overlay belongs here before lunar and planetary enrichment." />
      <StateBlock label="Celestial layers" value="Queued" detail="Moon, planet, and zodiac overlays deepen the daily field over time." />
    </div>
  );
}

function RiteCard() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Daily rite</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Generated from the active window</h3>
        <p className="mt-2 text-sm text-zinc-300">
          This card will become the contract surface for Tempus prompts, daily mantras, challenges, rites, and reflective tasks generated from the current conditions and correspondence layers.
        </p>
        <div className="mt-4 rounded-2xl border border-amber-200/25 bg-amber-200/10 p-3 text-sm text-amber-100">
          Placeholder example: Spend a few minutes with the present conditions, then return with a reflection or observation.
        </div>
      </div>
      <div className="grid gap-3">
        <StateBlock label="Prompt mode" value="Reflective" detail="Nature, emotion, discipline, symbol, or challenge can be emphasized here later." />
        <StateBlock label="Generator state" value="Pending" detail="Rite parameters will be assembled from active daily inputs." />
      </div>
    </div>
  );
}

function CalendarMonthCard() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Month map</div>
        <div className="mt-3 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-wide text-zinc-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, index) => (
            <button
              key={index}
              type="button"
              className="aspect-square rounded-2xl border border-white/10 bg-black/20 text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              {index + 1 <= 30 ? index + 1 : ''}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        <StateBlock label="Season overlay" value="Enabled" detail="Season labels and celestial events map across the familiar calendar first." />
        <StateBlock label="Day expansion" value="Tap a date" detail="Each day should open upward into a larger detail layer." />
        <StateBlock label="External sync" value="Future" detail="Google and Outlook integration belongs here later." />
      </div>
    </div>
  );
}

function AnnualSpiralCard() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Annual spiral</div>
        <div className="mt-4 grid place-items-center rounded-[2rem] border border-white/10 bg-black/20 p-6">
          <div className="relative h-72 w-72 rounded-full border border-white/10">
            <div className="absolute inset-[8%] rounded-full border border-white/10" />
            <div className="absolute inset-[18%] rounded-full border border-white/10" />
            <div className="absolute inset-[28%] rounded-full border border-white/10" />
            <div className="absolute inset-[38%] rounded-full border border-white/10" />
            <div className="absolute inset-[48%] rounded-full border border-white/10" />
            {Array.from({ length: 12 }, (_, index) => (
              <div
                key={index}
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/35 bg-amber-200/15"
                style={{
                  left: `${50 + Math.cos(((index * 30) - 90) * (Math.PI / 180)) * (34 - index * 1.5)}%`,
                  top: `${50 + Math.sin(((index * 30) - 90) * (Math.PI / 180)) * (34 - index * 1.5)}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        <StateBlock label="Presence" value="Monthly" detail="Months light when a rite or act of presence is recorded." />
        <StateBlock label="Scope" value="Past / present / near future" detail="The spiral should show historical memory and one year forward at most." />
        <StateBlock label="Interaction" value="Dial by year" detail="Users should be able to move the spiral through years and inspect months." />
      </div>
    </div>
  );
}

function HistoricalSkyCard() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Historical lens</div>
        <div className="mt-4 grid place-items-center rounded-[2rem] border border-white/10 bg-black/20 p-6">
          <div className="relative h-72 w-full max-w-[26rem] rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(125,190,255,.14),transparent_18%),radial-gradient(circle_at_50%_50%,rgba(246,196,83,.08),transparent_44%),rgba(6,10,20,.88)]">
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/30 bg-amber-200/12" />
            <div className="absolute left-[24%] top-[54%] h-6 w-6 rounded-full border border-sky-200/30 bg-sky-300/18" />
            <div className="absolute left-[66%] top-[32%] h-8 w-8 rounded-full border border-white/20 bg-white/[0.08]" />
            <div className="absolute inset-x-10 bottom-6 h-2 rounded-full bg-white/10">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-sky-300 via-amber-200 to-sky-300" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        <StateBlock label="Mode" value="Historical" detail="This layer is for moving through wider celestial time, not the daily readout." />
        <StateBlock label="Source mix" value="Observed / modeled" detail="Scientific reconstruction and mathematically modeled positions can coexist here." />
        <StateBlock label="Governance" value="Future" detail="Community-curated historical layers belong under later governance controls." />
      </div>
    </div>
  );
}

function CodexDomainCard({
  title,
  items,
  lockedLabel,
}: {
  title: string;
  items: string[];
  lockedLabel: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Codex domain</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">{title}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="text-sm font-medium text-zinc-100">{item}</div>
              <div className="mt-1 text-xs text-zinc-500">Opens a higher knowledge layer above the current card.</div>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        <StateBlock label="Visibility" value="Partially open" detail="The domain can be seen here without exposing the deepest layers immediately." />
        <StateBlock label="Unlock path" value="Layered" detail={lockedLabel} />
      </div>
    </div>
  );
}

function StateBlock({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-zinc-100">{value}</div>
      <div className="mt-1 text-xs text-zinc-400">{detail}</div>
    </div>
  );
}
