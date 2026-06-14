'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import AppStage from '@/components/ui/AppStage';
import ModuleMatrixShell from '@/components/ui/ModuleMatrixShell';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import { useTempusWindow } from '@/hooks/useTempusWindow';
import { TempusClockFace, TempusCodexLibrary, TempusMonthGrid } from './TempusContent';

type FamilyId = 'codex' | 'clock' | 'calendar';
type VerticalId = 'page-1' | 'page-2' | 'page-3';

type CardConfig = {
  id: VerticalId;
  title: string;
  caption: string;
  render: () => React.ReactNode;
};

type FamilyConfig = {
  href: string;
  label: string;
  shellAction: React.ReactNode;
  cards: CardConfig[];
};

const ORDER = ['/tempus/codex', '/tempus/clock', '/tempus/calendar'] as const;
const VERTICAL_TABS = [
  { id: 'page-1', label: 'Page 1' },
  { id: 'page-2', label: 'Page 2' },
  { id: 'page-3', label: 'Page 3' },
] as const;

function phaseText(phase: 'open' | 'rest' | 'silent') {
  return phase === 'open' ? 'Open' : phase === 'rest' ? 'Resting' : 'Silent';
}

export default function TempusModuleScreen({ family }: { family: FamilyId }) {
  const w = useTempusWindow();
  const [activeVertical, setActiveVertical] = useState<VerticalId>('page-1');

  const families = useMemo<Record<FamilyId, FamilyConfig>>(() => ({
    codex: {
      href: ORDER[0],
      label: 'Codex',
      shellAction: <div className="text-xs text-zinc-400">Correspondence library</div>,
      cards: [
        {
          id: 'page-1',
          title: 'Tempus — Codex · Page I',
          caption: 'Reference tables for the rhythms used by Clock and Calendar.',
          render: () => <TempusCodexLibrary current={w} />,
        },
        {
          id: 'page-2',
          title: 'Tempus — Codex · Page II',
          caption: 'A compact reading card for the current temporal state.',
          render: () => <StateGrid />,
        },
        {
          id: 'page-3',
          title: 'Tempus — Codex · Page III',
          caption: 'A quiet note card for symbolic context.',
          render: () => <SimpleNote title="Codex note" body="The codex remains interpretive and optional." />,
        },
      ],
    },
    clock: {
      href: ORDER[1],
      label: 'Clock',
      shellAction: <div className="text-xs text-zinc-400">{w.planetaryDay} · {w.isDay ? 'Day field' : 'Night field'}</div>,
      cards: [
        {
          id: 'page-1',
          title: 'Tempus — Clock Dial · Page I',
          caption: 'A live rhythm dial for planetary, solar, lunar, and zodiac correspondences.',
          render: () => <TempusClockFace />,
        },
        {
          id: 'page-2',
          title: 'Tempus — Clock Detail · Page II',
          caption: 'A readable state card for the current window.',
          render: () => <StateGrid />,
        },
        {
          id: 'page-3',
          title: 'Tempus — Clock Notes · Page III',
          caption: 'A note card for the layered model.',
          render: () => <SimpleNote title="Clock note" body="The clock witnesses timing without assigning status." />,
        },
      ],
    },
    calendar: {
      href: ORDER[2],
      label: 'Calendar',
      shellAction: <div className="text-xs text-zinc-400">Month grid · non-coercive</div>,
      cards: [
        {
          id: 'page-1',
          title: 'Tempus — Calendar Grid · Page I',
          caption: 'A season-first month surface for planetary days, lunar posture, and local rhythm.',
          render: () => <TempusMonthGrid />,
        },
        {
          id: 'page-2',
          title: 'Tempus — Calendar Detail · Page II',
          caption: 'A readable state card for the current window.',
          render: () => <StateGrid />,
        },
        {
          id: 'page-3',
          title: 'Tempus — Calendar Notes · Page III',
          caption: 'A note card for optional observation.',
          render: () => <SimpleNote title="Calendar note" body="Observation may be recorded or skipped without penalty." />,
        },
      ],
    },
  }), [w]);

  const activeFamily = families[family];
  const activeCard = activeFamily.cards.find((card) => card.id === activeVertical) ?? activeFamily.cards[0];

  useEffect(() => {
    setActiveVertical('page-1');
  }, [family]);

  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <ModuleMatrixShell
          title={<h1 className="text-lg font-semibold">{activeCard.title}</h1>}
          actions={activeFamily.shellAction}
          horizontalTabs={Object.values(families).map(({ href, label }) => ({ href, label }))}
          activeHorizontalHref={activeFamily.href}
          verticalTabs={VERTICAL_TABS}
          activeVerticalId={activeCard.id}
          onVerticalChange={(id) => setActiveVertical(id as VerticalId)}
          className="min-h-0 flex-1"
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">{activeCard.caption}</p>
            {activeCard.render()}
          </div>
        </ModuleMatrixShell>
      </AppStage>
    </SwipeRoutes>
  );
}

function StateGrid() {
  const w = useTempusWindow();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <StateBlock label="Window phase" value={phaseText(w.phase)} detail={w.isDay ? 'The local surface is in the daylight half of the cycle.' : 'The local surface is in the resting half of the cycle.'} />
      <StateBlock label="Planetary day" value={w.planetaryDay} detail="A day-tone label for orientation only." />
      <StateBlock label="Zodiac season" value={w.zodiacSign} detail={`Season day ${w.zodiacDay}.`} />
      <StateBlock label="Lunar phase" value={w.lunarPhase} detail={w.moonZodiac} />
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

function SimpleNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Note</div>
      <h3 className="mt-2 text-sm font-semibold text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm text-zinc-300">{body}</p>
    </div>
  );
}
