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
        shellAction: <div className="text-xs text-zinc-400">A track · calm threshold and relational posture</div>,
        cards: [
          {
            id: 'a1',
            navLabel: 'A1',
            title: 'Hope - A1 Posture',
            caption: 'Hope begins as a quiet threshold. This card shows the baseline relational posture before dialogue, interpretation, or tuning enters.',
            render: () => <PresencePostureCard posture={presencePosture} />,
          },
          {
            id: 'a2',
            navLabel: 'A2',
            title: 'Hope - A2 Orientation',
            caption: 'Presence is the orientation layer. It explains what Hope is, what it is not, and how the module can be approached without pressure.',
            render: () => <PresenceOrientationCard />,
          },
          {
            id: 'a3',
            navLabel: 'A3',
            title: 'Hope - A3 Next',
            caption: 'The handoff layer. From Presence, the user can continue toward Reflection for dialogue or Attunement for response shaping.',
            render: () => <PresenceNextCard />, 
          },
        ],
      },
      reflection: {
        href: ORDER[1],
        label: 'Reflection',
        shellAction: <div className="text-xs text-zinc-400">B track · compose, converse, and review local reflections</div>,
        cards: [
          {
            id: 'b1',
            navLabel: 'B1',
            title: 'Hope - B1 Compose',
            caption: 'Reflection is user-initiated. This card is the writing surface where a reflection can be recorded without converting Hope into authority.',
            render: () => <ReflectionComposeCard onRecorded={() => void loadHopeState()} />,
          },
          {
            id: 'b2',
            navLabel: 'B2',
            title: 'Hope - B2 Conversation',
            caption: 'The conversation surface remains advisory. Hope may clarify, mirror, or draft, but it does not execute, ratify, or confirm readiness.',
            render: () => <ReflectionConversationCard posture={reflectionPosture} />,
          },
          {
            id: 'b3',
            navLabel: 'B3',
            title: 'Hope - B3 Logs',
            caption: 'Local-private logs belong here. Tempus and Vitae context may be attached as context only, never as interpretation or authority.',
            render: () => <ReflectionLogsCard trusted={account.trusted} state={hopeState} />,
          },
        ],
      },
      attunement: {
        href: ORDER[2],
        label: 'Attunement',
        shellAction: <div className="text-xs text-zinc-400">C track · tone, intensity, and access shaping</div>,
        cards: [
          {
            id: 'c1',
            navLabel: 'C1',
            title: 'Hope - C1 Tone',
            caption: 'Tone is the visual and emotional envelope of Hope. Color, preset, and immediate feel belong here first.',
            render: () => <AttunementToneCard tone={tone} preset={preset} presence={presence} frequency={frequency} depth={depth} onPreset={setPreset} />,
          },
          {
            id: 'c2',
            navLabel: 'C2',
            title: 'Hope - C2 Intensity',
            caption: 'The intensity layer shapes how Hope appears and responds across presence, reflection frequency, and reflection depth.',
            render: () => (
              <AttunementIntensityCard
                tone={tone}
                presence={presence}
                frequency={frequency}
                depth={depth}
                onTone={setTone}
                onPresence={setPresence}
                onFrequency={setFrequency}
                onDepth={setDepth}
              />
            ),
          },
          {
            id: 'c3',
            navLabel: 'C3',
            title: 'Hope - C3 Access',
            caption: 'Attunement stays device-bound until activation is complete. This card keeps access, privacy, and advisory constraints visible.',
            render: () => <AttunementAccessCard trusted={account.trusted} posture={attunementPosture} reflectionCount={reflectionCount} latestReflectionAt={latestReflection?.createdAt ?? null} />,
          },
        ],
      },
    }),
    [account.trusted, hopeState, tone, preset, presence, frequency, depth]
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

function PresencePostureCard({ posture }: { posture: ReturnType<typeof createHopePosture> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,.95fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Current posture</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Quiet threshold</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MetricTile label="Mode" value="Pulse" />
          <MetricTile label="Demand" value="None" />
          <MetricTile label="Witness" value="Optional" />
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Authority posture</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Advisory only</h3>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <StateNote title="Clarify">{posture.canClarify ? 'Yes' : 'No'}</StateNote>
          <StateNote title="Execute">{posture.canExecute ? 'Yes' : 'No'}</StateNote>
          <StateNote title="Ratify">{posture.canRatify ? 'Yes' : 'No'}</StateNote>
          <StateNote title="Confirm readiness">{posture.canConfirmReadiness ? 'Yes' : 'No'}</StateNote>
        </div>
      </div>
    </div>
  );
}

function PresenceOrientationCard() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300 space-y-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Orientation</div>
        <h3 className="text-base font-semibold text-zinc-100">What Presence is</h3>
        <p>Presence is Hope in its quietest form: available, non-intrusive, and free from pressure loops.</p>
        <p>You are not required to speak, perform, or decide immediately. Hope can remain as atmosphere before it becomes dialogue.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300 space-y-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">What it is not</div>
        <h3 className="text-base font-semibold text-zinc-100">No pressure, no command</h3>
        <p>Presence does not demand response. It does not govern, diagnose, or assign readiness.</p>
        <p>It is a threshold state meant to reduce friction before a reflection is written or an attunement setting is changed.</p>
      </div>
    </div>
  );
}

function PresenceNextCard() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Next openings</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Move when you want</h3>
        <div className="mt-4 space-y-3">
          <Link href="/hope/reflection" className="block rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 hover:bg-white/10">Enter Reflection</Link>
          <Link href="/hope/attunement" className="block rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 hover:bg-white/10">Open Attunement</Link>
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Activation</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Device setup</h3>
        <div className="mt-4 text-sm text-zinc-300">
          Presence can be browsed freely. Local recording and private continuity become more useful after activation.
        </div>
        <div className="mt-4"><CTAActivate /></div>
      </div>
    </div>
  );
}

function ReflectionComposeCard({ onRecorded }: { onRecorded: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Compose</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Leave a reflection</h3>
        <div className="mt-4"><ReflectionEditor onRecorded={onRecorded} /></div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
        Reflection is user-initiated. Hope may clarify, mirror, and respond, but it does not command, execute, ratify, or confirm readiness.
      </div>
    </div>
  );
}

function ReflectionConversationCard({ posture }: { posture: ReturnType<typeof createHopePosture> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 min-h-[16rem]">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Conversation</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Speak with Hope</h3>
        <div className="mt-4 min-h-[10rem] rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          Hope reflection records are local advisory context. They are not governance decisions, diagnoses, or authority assignments.
        </div>
        <div className="mt-3 text-xs text-zinc-500">Conversational response generation is not enabled in this scaffold.</div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Response posture</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Capabilities and limits</h3>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <StateNote title="Clarify">{posture.canClarify ? 'Enabled in posture' : 'Disabled'}</StateNote>
          <StateNote title="Mirror">{posture.canMirror ? 'Enabled in posture' : 'Disabled'}</StateNote>
          <StateNote title="Draft">{posture.canDraft ? 'Enabled in posture' : 'Disabled'}</StateNote>
          <StateNote title="Execute / ratify">Never available here</StateNote>
        </div>
      </div>
    </div>
  );
}

function ReflectionLogsCard({ trusted, state }: { trusted: boolean; state: HopeState }) {
  if (!trusted) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Reflection logs</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Local-private after activation</h3>
        <div className="mt-4 text-sm text-zinc-400">Logs are local-private and available after ACC activation.</div>
        <div className="mt-4"><CTAActivate /></div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Reflection logs</div>
          <h3 className="mt-2 text-base font-semibold text-zinc-100">Local-private record</h3>
        </div>
        <LockHint label="Local private" />
      </div>
      <div className="mt-4 space-y-3">
        {state.reflections.length === 0 ? (
          <div className="text-sm text-zinc-400">No local Hope reflections recorded yet.</div>
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
              {(reflection.context?.tempus || reflection.context?.vitae) ? (
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

function AttunementToneCard({
  tone,
  preset,
  presence,
  frequency,
  depth,
  onPreset,
}: {
  tone: string;
  preset: (typeof PRESETS)[number];
  presence: number;
  frequency: number;
  depth: number;
  onPreset: (value: (typeof PRESETS)[number]) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
      <div className="space-y-4">
        <div className="grid aspect-square place-items-center rounded-3xl border border-white/10" style={{ background: tone }}>
          <div className="px-4 text-center text-xs uppercase tracking-wide text-black/70">{preset} · p:{presence} · f:{frequency} · d:{depth}</div>
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Preset tone</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Immediate feel</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onPreset(name)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs uppercase',
                preset === name
                  ? 'border-amber-400 bg-blue-700 text-amber-300'
                  : 'border-zinc-600 bg-neutral-900/60 text-zinc-300 hover:bg-white/5'
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

function AttunementIntensityCard({
  tone,
  presence,
  frequency,
  depth,
  onTone,
  onPresence,
  onFrequency,
  onDepth,
}: {
  tone: string;
  presence: number;
  frequency: number;
  depth: number;
  onTone: (value: string) => void;
  onPresence: (value: number) => void;
  onFrequency: (value: number) => void;
  onDepth: (value: number) => void;
}) {
  return (
    <div className="space-y-4">
      <SliderCard title="Presence Tone">
        <input type="color" value={tone} onChange={(e) => onTone(e.target.value)} className="h-9 w-16 rounded-md border border-white/15 bg-white/10" />
      </SliderCard>
      <SliderCard title="Presence Level">
        <input type="range" min={0} max={100} value={presence} onChange={(e) => onPresence(Number(e.target.value))} className="w-full" />
      </SliderCard>
      <SliderCard title="Reflection Frequency">
        <input type="range" min={0} max={100} value={frequency} onChange={(e) => onFrequency(Number(e.target.value))} className="w-full" />
      </SliderCard>
      <SliderCard title="Reflection Depth">
        <input type="range" min={0} max={100} value={depth} onChange={(e) => onDepth(Number(e.target.value))} className="w-full" />
      </SliderCard>
    </div>
  );
}

function AttunementAccessCard({
  trusted,
  posture,
  reflectionCount,
  latestReflectionAt,
}: {
  trusted: boolean;
  posture: ReturnType<typeof createHopePosture>;
  reflectionCount: number;
  latestReflectionAt: string | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Access</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Device-bound settings</h3>
        <div className="mt-4 space-y-3">
          <PermissionRow label="Save attunement locally" value={trusted ? 'Allowed' : 'Unavailable'} />
          <PermissionRow label="Reflection memory" value={trusted ? 'Local private' : 'Browse only'} />
          <PermissionRow label="Authority posture" value={posture.authority} />
          <PermissionRow label="Latest reflection" value={latestReflectionAt ? new Date(latestReflectionAt).toLocaleString() : 'None yet'} />
          <PermissionRow label="Reflection count" value={String(reflectionCount)} />
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Guardrails</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">What Hope cannot do</h3>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <p>Hope remains advisory only. Attunement changes expression, not authority.</p>
          <p>It cannot execute, ratify, or confirm readiness.</p>
          <div className="flex items-center gap-3 pt-1">
            <LockHint label={trusted ? 'ACC active' : 'ACC to save'} />
            {!trusted ? <CTAActivate /> : null}
          </div>
        </div>
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

function SliderCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
