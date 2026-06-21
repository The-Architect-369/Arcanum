'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppStage from '@/components/ui/AppStage';
import ModuleMatrixShell from '@/components/ui/ModuleMatrixShell';
import CTAActivate from '@/components/shared/CTAActivate';
import { LockHint } from '@/components/shared/LockHint';
import { cn } from '@/lib/cn';
import { createHopePosture, getHopeState, type HopeState } from '@/lib/hope/context';
import { useAccount } from '@/state/useAccount';
import { ReflectionEditor } from './ReflectionEditor';

export type HopeFamilyId = 'presence' | 'reflection' | 'attunement';
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

const ORDER = ['/hope/presence', '/hope/reflection', '/hope/attunement'] as const;
const FAMILY_BY_HREF: Record<(typeof ORDER)[number], HopeFamilyId> = {
  '/hope/presence': 'presence',
  '/hope/reflection': 'reflection',
  '/hope/attunement': 'attunement',
};
const FAMILY_INDEX: Record<HopeFamilyId, number> = {
  presence: 0,
  reflection: 1,
  attunement: 2,
};
const EMPTY_STATE: HopeState = {
  reflections: [],
  updatedAt: null,
};
const PRESETS = ['quiet', 'steady', 'warm', 'deep'] as const;
const COSMETIC_ITEMS = ['Founder halo', 'Lumen sash', 'Archive patch', 'Celestial trim', 'Kindred frame', 'Signal bloom'] as const;

function familyFromPathname(pathname: string): HopeFamilyId | null {
  const clean = pathname.split('?')[0]?.split('#')[0] || '';
  if (clean in FAMILY_BY_HREF) {
    return FAMILY_BY_HREF[clean as keyof typeof FAMILY_BY_HREF];
  }
  return null;
}

function motionForFamilyChange(from: HopeFamilyId, to: HopeFamilyId): FamilyMotion {
  if (from === to) return 'idle';
  return FAMILY_INDEX[to] > FAMILY_INDEX[from] ? 'next' : 'prev';
}

function subtitleFromCardTitle(title: string) {
  return title.replace(/^Hope\s*-\s*/i, '');
}

export function HopeModuleScreen({ family }: { family: HopeFamilyId }) {
  const account = useAccount();
  const [activeFamilyId, setActiveFamilyId] = useState<HopeFamilyId>(family);
  const [activeCardId, setActiveCardId] = useState<CardId>('a1');
  const [familyMotion, setFamilyMotion] = useState<FamilyMotion>('idle');
  const [familyMotionKey, setFamilyMotionKey] = useState(0);
  const [hopeState, setHopeState] = useState<HopeState>(EMPTY_STATE);
  const [tone, setTone] = useState('#9bb8ff');
  const [presence, setPresence] = useState(35);
  const [frequency, setFrequency] = useState(30);
  const [depth, setDepth] = useState(45);
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>('quiet');

  async function loadHopeState() {
    const next = await getHopeState();
    setHopeState(next);
  }

  useEffect(() => {
    void loadHopeState();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setFamilyMotion('idle'), 190);
    return () => window.clearTimeout(timer);
  }, [familyMotionKey]);

  const reflectionCount = hopeState.reflections.length;
  const latestReflection = hopeState.reflections[0] ?? null;
  const presencePosture = createHopePosture('presence');
  const reflectionPosture = createHopePosture('reflection');
  const attunementPosture = createHopePosture('attunement');

  const families = useMemo<Record<HopeFamilyId, FamilyConfig>>(
    () => ({
      presence: {
        href: ORDER[0],
        label: 'Presence',
        shellAction: <div className="text-xs text-zinc-400">A track · living self, dialogue, and present snapshot</div>,
        cards: [
          {
            id: 'a1',
            navLabel: 'A1',
            title: 'Hope - A1 Avatar',
            caption: 'The first glance. Hope appears here as the living, stylized reflection of the user: mood, visual state, and immediate presence.',
            render: () => <AvatarCard trusted={account.trusted} tone={tone} preset={preset} presence={presence} reflectionCount={reflectionCount} />, 
          },
          {
            id: 'a2',
            navLabel: 'A2',
            title: 'Hope - A2 Dialogue',
            caption: 'The direct conversation surface. This is where the user checks in, asks questions, and speaks with Hope without pressure or governance claims.',
            render: () => <DialogueCard posture={presencePosture} onRecorded={() => void loadHopeState()} />, 
          },
          {
            id: 'a3',
            navLabel: 'A3',
            title: 'Hope - A3 Snapshot',
            caption: 'The present readout. Hope summarizes what feels active now: emotional atmosphere, memory recency, and nearby openings in the app.',
            render: () => <SnapshotCard latestReflection={latestReflection} trusted={account.trusted} />, 
          },
        ],
      },
      reflection: {
        href: ORDER[1],
        label: 'Guidance',
        shellAction: <div className="text-xs text-zinc-400">B track · orientation, campaign builder, and active life arcs</div>,
        cards: [
          {
            id: 'b1',
            navLabel: 'B1',
            title: 'Hope - B1 Orientation',
            caption: 'The over-time guidance layer. Hope reflects the current pattern of the user’s life without turning that into command, judgment, or diagnosis.',
            render: () => <OrientationCard posture={reflectionPosture} latestReflection={latestReflection} />, 
          },
          {
            id: 'b2',
            navLabel: 'B2',
            title: 'Hope - B2 Campaign Builder',
            caption: 'The campaign builder shapes new arcs of life attention: healing cycles, intentions, practices, and self-authored missions.',
            render: () => <CampaignBuilderCard trusted={account.trusted} />, 
          },
          {
            id: 'b3',
            navLabel: 'B3',
            title: 'Hope - B3 Campaigns',
            caption: 'The campaign shelf keeps current and remembered life arcs visible. These campaigns are for reflection and continuity, not authority or rank.',
            render: () => <CampaignsCard state={hopeState} />, 
          },
        ],
      },
      attunement: {
        href: ORDER[2],
        label: 'Memory',
        shellAction: <div className="text-xs text-zinc-400">C track · natal pattern, cosmetics, and journal memory</div>,
        cards: [
          {
            id: 'c1',
            navLabel: 'C1',
            title: 'Hope - C1 Natal Pattern',
            caption: 'The foundational symbolic layer. This is where Hope’s deeper patterning can live: natal structure, archetypal tones, and stable identity signatures.',
            render: () => <NatalPatternCard tone={tone} preset={preset} presence={presence} frequency={frequency} depth={depth} posture={attunementPosture} />, 
          },
          {
            id: 'c2',
            navLabel: 'C2',
            title: 'Hope - C2 Cosmetic Inventory',
            caption: 'The expressive inventory. Cosmetics, unlocks, frames, accessories, and community-created adornments gather here as part of Hope’s visible identity.',
            render: () => <CosmeticInventoryCard tone={tone} preset={preset} onPreset={setPreset} />, 
          },
          {
            id: 'c3',
            navLabel: 'C3',
            title: 'Hope - C3 Journal',
            caption: 'The memory archive. Journal entries, chat history, and attached Tempus or Vitae context remain private reflective memory unless the user chooses otherwise.',
            render: () => <JournalCard trusted={account.trusted} state={hopeState} />, 
          },
        ],
      },
    }),
    [account.trusted, hopeState, tone, preset, presence, frequency, depth, reflectionCount, latestReflection, presencePosture, reflectionPosture, attunementPosture]
  );

  const activeFamily = families[activeFamilyId];
  const activeCard = activeFamily.cards.find((card) => card.id === activeCardId) ?? activeFamily.cards[0];
  const verticalTabs = activeFamily.cards.map((card) => ({ id: card.id, label: card.navLabel }));
  const titleSubtitle = subtitleFromCardTitle(activeCard.title);

  const transitionToFamily = (nextFamily: HopeFamilyId, syncHistory: boolean) => {
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
              <span className="tempus-title-word truncate">Hope</span>
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

function AvatarCard({ trusted, tone, preset, presence, reflectionCount }: { trusted: boolean; tone: string; preset: string; presence: number; reflectionCount: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="grid aspect-square place-items-center rounded-[2rem] border border-white/10" style={{ background: tone }}>
          <div className="space-y-2 text-center">
            <div className="text-5xl">✦</div>
            <div className="text-xs uppercase tracking-[0.22em] text-black/70">{preset} presence</div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Avatar state</div>
          <h3 className="mt-2 text-base font-semibold text-zinc-100">Living self snapshot</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MetricTile label="Mood hue" value={preset} />
            <MetricTile label="Presence" value={`${presence}%`} />
            <MetricTile label="Memory" value={`${reflectionCount} entries`} />
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
          Hope is meant to feel alive here: stylized, responsive, and personal. This card becomes more compelling as avatar cosmetics, states, and emotes deepen.
          <div className="mt-4">{trusted ? <LockHint label="ACC active" /> : <CTAActivate />}</div>
        </div>
      </div>
    </div>
  );
}

function DialogueCard({ posture, onRecorded }: { posture: ReturnType<typeof createHopePosture>; onRecorded: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Dialogue</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Speak with Hope</h3>
        <div className="mt-4"><ReflectionEditor onRecorded={onRecorded} /></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StateNote title="Clarify">{posture.canClarify ? 'Hope can clarify and mirror.' : 'Clarification is unavailable in this posture.'}</StateNote>
        <StateNote title="Boundary">Hope does not execute, ratify, or confirm readiness here.</StateNote>
      </div>
    </div>
  );
}

function SnapshotCard({ latestReflection, trusted }: { latestReflection: HopeState['reflections'][number] | null; trusted: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Snapshot</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">What feels active now</h3>
        <div className="mt-4 space-y-3">
          <PermissionRow label='Latest reflection' value={latestReflection ? new Date(latestReflection.createdAt).toLocaleString() : 'No recent entry'} />
          <PermissionRow label='Current opening' value='Dialogue, memory, and soft self-check-ins' />
          <PermissionRow label='Notification posture' value='Check-in style, not command style' />
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
        Hope works best as a gentle companion. {trusted ? 'This device can hold a private continuity of dialogue and memory.' : 'Activate this device to make private continuity and journaling more useful.'}
      </div>
    </div>
  );
}

function OrientationCard({ posture, latestReflection }: { posture: ReturnType<typeof createHopePosture>; latestReflection: HopeState['reflections'][number] | null }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300 space-y-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Orientation</div>
        <h3 className="text-base font-semibold text-zinc-100">Bigger life pattern</h3>
        <p>Hope can help the user see themes, recurrences, and emotional weather over time without claiming diagnosis or authority.</p>
        <p>{latestReflection ? `The latest remembered entry was recorded on ${new Date(latestReflection.createdAt).toLocaleString()}.` : 'No reflection has been recorded yet, so the pattern layer is still quiet.'}</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Guidance posture</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Advisory only</h3>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <StateNote title="Mirror">{posture.canMirror ? 'Enabled in posture' : 'Disabled'}</StateNote>
          <StateNote title="Draft">{posture.canDraft ? 'Enabled in posture' : 'Disabled'}</StateNote>
          <StateNote title="Govern">Never</StateNote>
        </div>
      </div>
    </div>
  );
}

function CampaignBuilderCard({ trusted }: { trusted: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300 space-y-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Campaign builder</div>
        <h3 className="text-base font-semibold text-zinc-100">Shape a life arc</h3>
        <p>This card can later generate guided arcs like healing cycles, habit journeys, reflection missions, or seasonal self-check-ins.</p>
        <p>The builder belongs in Hope because it is about inner direction and continuity, not governance or rank.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
        {trusted ? 'Campaign creation can stay local-first and private by default.' : 'Activation should unlock private saved campaign arcs on this device.'}
      </div>
    </div>
  );
}

function CampaignsCard({ state }: { state: HopeState }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Campaign shelf</div>
      <h3 className="mt-2 text-base font-semibold text-zinc-100">Current and remembered arcs</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricTile label='Reflections' value={String(state.reflections.length)} />
        <MetricTile label='Active arcs' value='Scaffold pending' />
        <MetricTile label='Completed arcs' value='Scaffold pending' />
      </div>
      <p className="mt-4 text-sm text-zinc-300">This shelf will eventually hold active campaigns, paused campaigns, and completed reflective arcs without turning personal life into a public score.</p>
    </div>
  );
}

function NatalPatternCard({ tone, preset, presence, frequency, depth, posture }: { tone: string; preset: string; presence: number; frequency: number; depth: number; posture: ReturnType<typeof createHopePosture> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
      <div className="rounded-3xl border border-white/10 p-4" style={{ background: `linear-gradient(180deg, ${tone}22, rgba(0,0,0,0.28))` }}>
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Natal pattern</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Foundational signature</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MetricTile label='Preset' value={preset} />
          <MetricTile label='Presence' value={`${presence}%`} />
          <MetricTile label='Frequency' value={`${frequency}%`} />
          <MetricTile label='Depth' value={`${depth}%`} />
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
        This card can grow into Hope’s natal and symbolic blueprint. For now it holds stable identity tone and posture while leaving room for richer chart interpretation later.
        <div className="mt-4"><PermissionRow label='Authority posture' value={posture.authority} /></div>
      </div>
    </div>
  );
}

function CosmeticInventoryCard({ tone, preset, onPreset }: { tone: string; preset: (typeof PRESETS)[number]; onPreset: (value: (typeof PRESETS)[number]) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,.95fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Cosmetic inventory</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Visible style and adornment</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {COSMETIC_ITEMS.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">{item}</div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="grid aspect-square place-items-center rounded-[2rem] border border-white/10" style={{ background: tone }}>
          <div className="px-4 text-center text-xs uppercase tracking-wide text-black/70">{preset} fit</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onPreset(name)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs uppercase',
                preset === name ? 'border-amber-400 bg-blue-700 text-amber-300' : 'border-zinc-600 bg-neutral-900/60 text-zinc-300 hover:bg-white/5'
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function JournalCard({ trusted, state }: { trusted: boolean; state: HopeState }) {
  if (!trusted) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Journal</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Private memory after activation</h3>
        <div className="mt-4 text-sm text-zinc-400">Journal memory is local-private and becomes more useful after ACC activation.</div>
        <div className="mt-4"><CTAActivate /></div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Journal</div>
          <h3 className="mt-2 text-base font-semibold text-zinc-100">Local-private memory archive</h3>
        </div>
        <LockHint label="Local private" />
      </div>
      <div className="mt-4 space-y-3">
        {state.reflections.length === 0 ? (
          <div className="text-sm text-zinc-400">No local Hope journal entries recorded yet.</div>
        ) : (
          state.reflections.map((reflection) => (
            <article key={reflection.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span>{reflection.mode}</span>
                <span>•</span>
                <span>{new Date(reflection.createdAt).toLocaleString()}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase">{reflection.authority}</span>
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{reflection.userText}</div>
              {reflection.context?.tempus || reflection.context?.vitae ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-400">
                  <div className="font-medium text-zinc-300">Attached local context</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {reflection.context?.tempus ? (
                      <>
                        <span>{reflection.context.tempus.phase} window</span>
                        <span>{reflection.context.tempus.solar.season}</span>
                        <span>{reflection.context.tempus.lunar.phase}</span>
                      </>
                    ) : null}
                    {reflection.context?.vitae ? (
                      <>
                        <span>Vitae sessions: {reflection.context.vitae.sessionCount}</span>
                        <span>Path: {reflection.context.vitae.selectedPath ?? 'none'}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">Context only; not interpretation, recognition, or authority.</div>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</div>
      <div className="mt-1 text-sm text-zinc-100">{value}</div>
    </div>
  );
}

function StateNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-sm font-medium text-zinc-100">{title}</div>
      <div className="mt-1 text-sm text-zinc-300">{children}</div>
    </div>
  );
}

function PermissionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-sm text-zinc-300">{label}</div>
      <div className="text-right text-sm text-zinc-100">{value}</div>
    </div>
  );
}
