'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import AppStage from '@/components/ui/AppStage';
import ModuleMatrixShell from '@/components/ui/ModuleMatrixShell';
import CTAActivate from '@/components/shared/CTAActivate';
import { LockHint } from '@/components/shared/LockHint';
import { HopePresenceScene } from '@/components/hope/HopePresenceScene';
import { cn } from '@/lib/cn';
import { createHopePosture, getHopeState, type HopeState } from '@/lib/hope/context';
import { useHopeRenderState } from '@/lib/hope/useHopeRenderState';
import { useHopeVisualState } from '@/lib/hope/useHopeVisualState';
import type { HopeRenderState } from '@/lib/hope/render';
import type { HopeVisualState } from '@/lib/hope/visual';
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
const COSMETIC_ITEMS = ['Founder halo', 'Lumen sash', 'Archive patch', 'Celestial trim', 'Kindred frame', 'Signal bloom'] as const;

function familyFromPathname(pathname: string): HopeFamilyId | null {
  const clean = pathname.split('?')[0]?.split('#')[0] || '';
  if (clean in FAMILY_BY_HREF) return FAMILY_BY_HREF[clean as keyof typeof FAMILY_BY_HREF];
  return null;
}

function motionForFamilyChange(from: HopeFamilyId, to: HopeFamilyId): FamilyMotion {
  if (from === to) return 'idle';
  return FAMILY_INDEX[to] > FAMILY_INDEX[from] ? 'next' : 'prev';
}

function subtitleFromCardTitle(title: string) {
  return title.replace(/^Hope\s*-\s*/i, '');
}

function formatTimestamp(value: string | null | undefined) {
  if (!value) return 'No recent entry';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No recent entry';
  return date.toLocaleString();
}

export function HopeModuleScreen({ family }: { family: HopeFamilyId }) {
  const account = useAccount();
  const [activeFamilyId, setActiveFamilyId] = useState<HopeFamilyId>(family);
  const [activeCardId, setActiveCardId] = useState<CardId>('a1');
  const [familyMotion, setFamilyMotion] = useState<FamilyMotion>('idle');
  const [familyMotionKey, setFamilyMotionKey] = useState(0);
  const [hopeState, setHopeState] = useState<HopeState>(EMPTY_STATE);

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

  const renderState = useHopeRenderState(hopeState, { trusted: account.trusted });
  const visualState = useHopeVisualState(renderState);

  const latestReflection = hopeState.reflections[0] ?? null;
  const presencePosture = createHopePosture('presence');
  const reflectionPosture = createHopePosture('reflection');
  const attunementPosture = createHopePosture('attunement');

  const families = useMemo<Record<HopeFamilyId, FamilyConfig>>(
    () => ({
      presence: {
        href: ORDER[0],
        label: 'Presence',
        shellAction: <div className="text-xs text-zinc-400">A track · avatar, snapshot, and dialogue</div>,
        cards: [
          {
            id: 'a1',
            navLabel: 'A1',
            title: 'Hope - A1 Avatar',
            caption:
              'The first glance. Hope appears here as the living visual self: the current companion body, active mood treatment, and the first emotionally legible surface of the module.',
            render: () => (
              <AvatarCard
                trusted={account.trusted}
                renderState={renderState}
                visualState={visualState}
                reflectionCount={hopeState.reflections.length}
              />
            ),
          },
          {
            id: 'a2',
            navLabel: 'A2',
            title: 'Hope - A2 Snapshot',
            caption: 'The present readout. Snapshot explains what Hope is currently showing: emotional atmosphere, active themes, and nearby openings across the Arcanum.',
            render: () => <SnapshotCard latestReflection={latestReflection} trusted={account.trusted} renderState={renderState} visualState={visualState} />,
          },
          {
            id: 'a3',
            navLabel: 'A3',
            title: 'Hope - A3 Dialogue',
            caption:
              'The direct conversation surface. This is where the user checks in, speaks with Hope, and creates the captured input that later shapes campaigns, logs, and state changes.',
            render: () => <DialogueCard posture={presencePosture} onRecorded={() => void loadHopeState()} />,
          },
        ],
      },
      reflection: {
        href: ORDER[1],
        label: 'Campaigns',
        shellAction: <div className="text-xs text-zinc-400">B track · orientation, campaigns, and creation</div>,
        cards: [
          {
            id: 'b1',
            navLabel: 'B1',
            title: 'Hope - B1 Orientation',
            caption:
              'The over-time dashboard. Orientation gathers what is active across Arcanum life first: Tempus windows, Vitae openings, and the highest-priority campaign signals that matter now.',
            render: () => <OrientationCard posture={reflectionPosture} latestReflection={latestReflection} renderState={renderState} />,
          },
          {
            id: 'b2',
            navLabel: 'B2',
            title: 'Hope - B2 Campaigns',
            caption:
              'The quest log. Campaigns keep active arcs, paused arcs, and remembered life missions visible so the user can understand the larger shape of what Hope is helping them build.',
            render: () => <CampaignsCard state={hopeState} renderState={renderState} />,
          },
          {
            id: 'b3',
            navLabel: 'B3',
            title: 'Hope - B3 Create',
            caption:
              'The creation surface. New campaigns, missions, and life-domain arcs should begin here and later be seeded from conversation capture rather than burdensome manual setup alone.',
            render: () => <CampaignBuilderCard trusted={account.trusted} />,
          },
        ],
      },
      attunement: {
        href: ORDER[2],
        label: 'Archive',
        shellAction: <div className="text-xs text-zinc-400">C track · inventory, natal pattern, and logs</div>,
        cards: [
          {
            id: 'c1',
            navLabel: 'C1',
            title: 'Hope - C1 Inventory',
            caption:
              'The held-object layer. Cosmetics, unlocks, frames, habitats, and visible Hope adornments gather here so the user can shape the companion’s appearance over time.',
            render: () => <CosmeticInventoryCard renderState={renderState} visualState={visualState} />,
          },
          {
            id: 'c2',
            navLabel: 'C2',
            title: 'Hope - C2 Natal Pattern',
            caption:
              'The symbolic pattern layer. This is where natal structure, archetypal affinities, and later emotional or elemental containers can become readable without collapsing into diagnosis.',
            render: () => <NatalPatternCard renderState={renderState} visualState={visualState} posture={attunementPosture} />,
          },
          {
            id: 'c3',
            navLabel: 'C3',
            title: 'Hope - C3 Logs',
            caption:
              'The private archive. Conversation memory, journal entries, and attached Tempus or Vitae context remain locally held reflective memory unless the user chooses otherwise.',
            render: () => <JournalCard trusted={account.trusted} state={hopeState} />,
          },
        ],
      },
    }),
    [account.trusted, hopeState, latestReflection, presencePosture, reflectionPosture, attunementPosture, renderState, visualState]
  );

  const activeFamily = families[activeFamilyId];
  const activeCard = activeFamily.cards.find((card) => card.id === activeCardId) ?? activeFamily.cards[0];
  const verticalTabs = activeFamily.cards.map((card) => ({ id: card.id, label: card.navLabel }));
  const titleSubtitle = subtitleFromCardTitle(activeCard.title);

  const transitionToFamily = (nextFamily: HopeFamilyId, syncHistory: boolean) => {
    if (nextFamily === activeFamilyId) return;
    const motion = motionForFamilyChange(activeFamilyId, nextFamily);
    if (syncHistory) window.history.replaceState(window.history.state, '', families[nextFamily].href);
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
    if (swipeLock.current === 'h') e.preventDefault();
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
    transitionToFamily(FAMILY_BY_HREF[ORDER[nextIndex]], true);
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

function AvatarCard({
  trusted,
  renderState,
  visualState,
  reflectionCount,
}: {
  trusted: boolean;
  renderState: HopeRenderState;
  visualState: HopeVisualState;
  reflectionCount: number;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
      <HopePresenceScene
        renderState={renderState}
        visualState={visualState}
        footer={<div className="text-[11px] uppercase tracking-[0.18em] text-white/50">living interface layer</div>}
      />
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Avatar state</div>
          <h3 className="mt-2 text-base font-semibold text-zinc-100">Living self snapshot</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MetricTile label="Presence field" value={`${renderState.presencePercent}%`} />
            <MetricTile label="Atmosphere" value={renderState.emotionalPreset} />
            <MetricTile label="Memory" value={`${reflectionCount} entries`} />
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
          Wave 2 decomposes the avatar into scene, field, aura, avatar, and core primitives. Presence is now an explicit visual subsystem rather than a card-local rendering trick.
          <div className="mt-4">{trusted ? <LockHint label="ACC active" /> : <CTAActivate />}</div>
        </div>
      </div>
    </div>
  );
}

function SnapshotCard({
  latestReflection,
  trusted,
  renderState,
  visualState,
}: {
  latestReflection: HopeState['reflections'][number] | null;
  trusted: boolean;
  renderState: HopeRenderState;
  visualState: HopeVisualState;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_22rem]">
      <HopePresenceScene
        renderState={renderState}
        visualState={visualState}
        size={148}
        variant="compact"
        footer={<div className="text-[11px] uppercase tracking-[0.18em] text-white/50">snapshot field</div>}
      >
        <div className="space-y-3">
          <PermissionRow label="Latest reflection" value={formatTimestamp(latestReflection?.createdAt)} />
          <PermissionRow label="Atmosphere" value={`${renderState.emotionalPreset} · ${renderState.presenceMode}`} />
          <PermissionRow label="Motion language" value={visualState.motion.profile} />
          <PermissionRow label="Field state" value={visualState.environment.backgroundField} />
        </div>
      </HopePresenceScene>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
        Hope works best as a gentle companion. {trusted ? 'This device can hold a private continuity of dialogue and memory.' : 'Activate this device to make private continuity and journaling more useful.'}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
          Check-in style, not command style
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
        <div className="mt-4">
          <ReflectionEditor onRecorded={onRecorded} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StateNote title="Clarify">{posture.canClarify ? 'Hope can clarify and mirror.' : 'Clarification is unavailable in this posture.'}</StateNote>
        <StateNote title="Boundary">Hope does not execute, ratify, or confirm readiness here.</StateNote>
      </div>
    </div>
  );
}

function OrientationCard({
  posture,
  latestReflection,
  renderState,
}: {
  posture: ReturnType<typeof createHopePosture>;
  latestReflection: HopeState['reflections'][number] | null;
  renderState: HopeRenderState;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 space-y-3 text-sm text-zinc-300">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Orientation</div>
        <h3 className="text-base font-semibold text-zinc-100">Bigger life pattern</h3>
        <p>Hope can help the user see themes, recurrences, and active openings across Arcanum life without turning that into command, judgment, or diagnosis.</p>
        <p>{latestReflection ? `The latest remembered entry was recorded on ${formatTimestamp(latestReflection.createdAt)}.` : 'No reflection has been recorded yet, so the pattern layer is still quiet.'}</p>
        <p>Current atmosphere reads as {renderState.emotionalPreset} with a {renderState.presenceMode} motion posture.</p>
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

function CampaignsCard({ state, renderState }: { state: HopeState; renderState: HopeRenderState }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Campaign shelf</div>
      <h3 className="mt-2 text-base font-semibold text-zinc-100">Current and remembered arcs</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricTile label="Reflections" value={String(state.reflections.length)} />
        <MetricTile label="Presence mode" value={renderState.presenceMode} />
        <MetricTile label="Dialogue state" value={renderState.dialogueState} />
      </div>
      <p className="mt-4 text-sm text-zinc-300">This shelf will eventually hold active campaigns, paused campaigns, and completed reflective arcs without turning personal life into a public score.</p>
    </div>
  );
}

function CampaignBuilderCard({ trusted }: { trusted: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 space-y-3 text-sm text-zinc-300">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Create</div>
        <h3 className="text-base font-semibold text-zinc-100">Shape a new life arc</h3>
        <p>This card can later generate guided arcs like healing cycles, missions, aspirations, or domain-based campaigns seeded from conversation and user intent.</p>
        <p>The creator belongs in Hope because it is about shaping continuity and support, not governance or rank.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
        {trusted ? 'Campaign creation can stay local-first and private by default.' : 'Activation should unlock private saved campaign arcs on this device.'}
      </div>
    </div>
  );
}

function CosmeticInventoryCard({
  renderState,
  visualState,
}: {
  renderState: HopeRenderState;
  visualState: HopeVisualState;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,.95fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Inventory</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Visible style and adornment</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {COSMETIC_ITEMS.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div
          className="grid aspect-square place-items-center rounded-[2rem] border border-white/10"
          style={{
            background: `radial-gradient(circle at center, ${visualState.palette.core} 0%, ${visualState.palette.field} 58%, rgba(2,6,23,0.88) 100%)`,
          }}
        >
          <div className="px-4 text-center text-xs uppercase tracking-wide text-white/75">
            {renderState.emotionalPreset} field
            <div className="mt-2 text-[11px] tracking-[0.18em] text-white/55">{visualState.motion.profile} motion</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NatalPatternCard({
  renderState,
  visualState,
  posture,
}: {
  renderState: HopeRenderState;
  visualState: HopeVisualState;
  posture: ReturnType<typeof createHopePosture>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
      <div
        className="rounded-3xl border border-white/10 p-4"
        style={{
          background: `linear-gradient(180deg, ${visualState.palette.field}, rgba(0,0,0,0.28))`,
        }}
      >
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">Natal pattern</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Foundational signature</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MetricTile label="Atmosphere" value={renderState.emotionalPreset} />
          <MetricTile label="Presence" value={`${renderState.presencePercent}%`} />
          <MetricTile label="Field state" value={visualState.environment.backgroundField} />
          <MetricTile label="Transition" value={renderState.transitionState} />
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
        This card can grow into Hope’s natal and symbolic blueprint. For now it names the render-driven visual posture without letting page-local settings impersonate identity.
        <div className="mt-4">
          <PermissionRow label="Authority posture" value={posture.authority} />
        </div>
      </div>
    </div>
  );
}

function JournalCard({ trusted, state }: { trusted: boolean; state: HopeState }) {
  if (!trusted) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Logs</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Private archive</h3>
        <p className="mt-4 text-sm text-zinc-300">Activate this device to keep reflective continuity local-first and private.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Logs</div>
      <h3 className="mt-2 text-base font-semibold text-zinc-100">Private archive</h3>
      <div className="mt-4 space-y-3">
        {state.reflections.length ? (
          state.reflections.slice(0, 6).map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
              <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{entry.mode}</div>
              <div className="mt-1 text-zinc-100">{formatTimestamp(entry.createdAt)}</div>
              <div className="mt-2 line-clamp-3">{entry.userText}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-300">No local reflections have been recorded yet.</p>
        )}
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-zinc-100">{value}</div>
    </div>
  );
}

function PermissionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <span className="text-zinc-400">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}

function StateNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
