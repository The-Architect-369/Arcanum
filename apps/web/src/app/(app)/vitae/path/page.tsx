'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import AppStage from '@/components/ui/AppStage';
import ModuleMatrixShell from '@/components/ui/ModuleMatrixShell';
import CTAActivate from '@/components/shared/CTAActivate';
import { LockHint } from '@/components/shared/LockHint';
import { cn } from '@/lib/cn';
import { VITAE_SCHOOLS, VITAE_SPECIALIZATIONS } from '@/lib/mobile/vitae-map';
import { getVitaeState, recordVitaeSession, selectVitaePath, summarizeVitae, VITAE_PATHS, VITAE_PRACTICES, type VitaePathKey, type VitaeState } from '@/lib/mobile/vitae';
import { captureTempusContext } from '@/lib/tempus/context';
import { useAccount } from '@/state/useAccount';

type FamilyId = 'path' | 'map' | 'record';
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

const ORDER = ['/vitae/path', '/vitae/grade', '/vitae/mastery'] as const;
const FAMILY_BY_HREF: Record<(typeof ORDER)[number], FamilyId> = {
  '/vitae/path': 'path',
  '/vitae/grade': 'map',
  '/vitae/mastery': 'record',
};
const FAMILY_INDEX: Record<FamilyId, number> = {
  path: 0,
  map: 1,
  record: 2,
};
const EMPTY_VITAE_STATE: VitaeState = {
  selectedPath: null,
  sessions: [],
  updatedAt: null,
};

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
  return title.replace(/^Vitae\s*-\s*/i, '');
}

export default function VitaePathPage() {
  return <VitaeModuleScreen family="path" />;
}

export function VitaeModuleScreen({ family }: { family: FamilyId }) {
  const account = useAccount();
  const [activeFamilyId, setActiveFamilyId] = useState<FamilyId>(family);
  const [activeCardId, setActiveCardId] = useState<CardId>('a1');
  const [familyMotion, setFamilyMotion] = useState<FamilyMotion>('idle');
  const [familyMotionKey, setFamilyMotionKey] = useState(0);
  const [vitaeState, setVitaeState] = useState<VitaeState>(EMPTY_VITAE_STATE);
  const [message, setMessage] = useState<string | null>(null);

  const summary = useMemo(() => summarizeVitae(vitaeState), [vitaeState]);
  const selectedPath = VITAE_PATHS.find((path) => path.key === vitaeState.selectedPath) ?? null;
  const visibleGrades = VITAE_SCHOOLS.flatMap((school) => school.grades);

  async function loadState() {
    const next = await getVitaeState();
    setVitaeState(next);
  }

  useEffect(() => {
    void loadState();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setFamilyMotion('idle'), 190);
    return () => window.clearTimeout(timer);
  }, [familyMotionKey]);

  async function choosePath(path: VitaePathKey) {
    if (!account.trusted) {
      setMessage('Activate on this device to save a Vitae orientation.');
      return;
    }
    await selectVitaePath(path);
    await loadState();
    setMessage(`Saved ${path} as the active Vitae orientation on this device.`);
  }

  async function logPractice(practiceId: string) {
    if (!account.trusted) {
      setMessage('Activate on this device to record Vitae practice.');
      return;
    }

    const practice = VITAE_PRACTICES.find((item) => item.id === practiceId) ?? VITAE_PRACTICES[0];
    const tempusContext = captureTempusContext(new Date(), { depth: 'seasonal' });
    await recordVitaeSession({
      practiceId: practice.id,
      minutes: practice.suggestedMinutes,
      notes: `Quick record from ${practice.title} practice shelf.`,
      tempusContext,
      issueRitesCredit: false,
    });
    await loadState();
    setMessage(`Recorded ${practice.title} into the local Vitae record.`);
  }

  const families = useMemo<Record<FamilyId, FamilyConfig>>(
    () => ({
      path: {
        href: ORDER[0],
        label: 'Path',
        shellAction: <div className="text-xs text-zinc-400">A track · present position, state, and next threshold</div>,
        cards: [
          {
            id: 'a1',
            navLabel: 'A1',
            title: 'Vitae - A1 Position',
            caption: 'The present slice of the Vitae. This surface should answer where you are currently oriented, what school is visible, and what local emphasis is being held on this device.',
            render: () => (
              <PositionCard
                trusted={account.trusted}
                selectedPath={selectedPath}
                summary={summary}
                onChoosePath={choosePath}
              />
            ),
          },
          {
            id: 'a2',
            navLabel: 'A2',
            title: 'Vitae - A2 State',
            caption: 'The state layer. Reliability, continuity, pauses, and device readiness belong here without turning the Vitae into pressure or scorekeeping.',
            render: () => <StateCard trusted={account.trusted} state={vitaeState} summary={summary} />,
          },
          {
            id: 'a3',
            navLabel: 'A3',
            title: 'Vitae - A3 Next Threshold',
            caption: 'The threshold layer. This card shows what is visible now, what remains later, and how the next opening is approached without false urgency.',
            render: () => <ThresholdCard selectedPath={selectedPath} summary={summary} visibleGrades={visibleGrades.length} />,
          },
        ],
      },
      map: {
        href: ORDER[1],
        label: 'Map',
        shellAction: <div className="text-xs text-zinc-400">B track · schools, grades, atlas, and specializations</div>,
        cards: [
          {
            id: 'b1',
            navLabel: 'B1',
            title: 'Vitae - B1 Core Ladder',
            caption: 'The core ladder. Schools and grades should be legible first so the whole academy can be understood without pressure or gamified progress.',
            render: () => <CoreLadderCard />,
          },
          {
            id: 'b2',
            navLabel: 'B2',
            title: 'Vitae - B2 Atlas',
            caption: 'The whole-journey view. This is where the wider tree, atlas, and future visual curriculum map can grow without collapsing the academy into a checklist.',
            render: () => <AtlasCard />,
          },
          {
            id: 'b3',
            navLabel: 'B3',
            title: 'Vitae - B3 Specializations',
            caption: 'The post-Adept layer. Specializations are adjacent stewardship domains, not ranks, and should feel expansive rather than vertical.',
            render: () => <SpecializationsCard />,
          },
        ],
      },
      record: {
        href: ORDER[2],
        label: 'Record',
        shellAction: <div className="text-xs text-zinc-400">C track · practices, evidence, and permissions</div>,
        cards: [
          {
            id: 'c1',
            navLabel: 'C1',
            title: 'Vitae - C1 Practice Shelf',
            caption: 'The extractive layer. Practices you want to return to can be surfaced here as a shelf, without forcing you back through the entire Vitae every time.',
            render: () => <PracticeShelfCard trusted={account.trusted} onQuickRecord={logPractice} />,
          },
          {
            id: 'c2',
            navLabel: 'C2',
            title: 'Vitae - C2 Evidence',
            caption: 'The evidence layer. Local receipts, continuity memory, and factual traces belong here, separate from claims of advancement or mastery.',
            render: () => <EvidenceCard state={vitaeState} />,
          },
          {
            id: 'c3',
            navLabel: 'C3',
            title: 'Vitae - C3 Permissions',
            caption: 'The permissions layer. Vitae can remember what this device may hold or record, while governance-level stewardship stays invited rather than claimed.',
            render: () => <PermissionsCard trusted={account.trusted} summary={summary} />,
          },
        ],
      },
    }),
    [account.trusted, selectedPath, summary, vitaeState]
  );

  const activeFamily = families[activeFamilyId];
  const activeCard = activeFamily.cards.find((card) => card.id === activeCardId) ?? activeFamily.cards[0];
  const verticalTabs = activeFamily.cards.map((card) => ({ id: card.id, label: card.navLabel }));
  const titleSubtitle = subtitleFromCardTitle(activeCard.title);

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
              <span className="tempus-title-word truncate">Vitae</span>
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
            {message ? (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-sm text-amber-100">
                {message}
              </div>
            ) : null}
            {activeCard.render()}
          </div>
        </ModuleMatrixShell>
      </div>
    </AppStage>
  );
}

function PositionCard({
  trusted,
  selectedPath,
  summary,
  onChoosePath,
}: {
  trusted: boolean;
  selectedPath: (typeof VITAE_PATHS)[number] | null;
  summary: ReturnType<typeof summarizeVitae>;
  onChoosePath: (path: VitaePathKey) => void | Promise<void>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Current position</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Present Vitae locus</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MetricTile label="Orientation" value={selectedPath?.title ?? 'Unset'} />
          <MetricTile label="Visible school" value="Core Vitae" />
          <MetricTile label="Grade signal" value="Registry pending" />
          <MetricTile label="Class signal" value="Class map pending" />
        </div>
        <p className="mt-4 text-sm text-zinc-300">
          The current app can hold local orientation safely, but grade, class, and chapter position still need a fuller Vitae runtime registry before they can be stated truthfully.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Path emphasis</div>
            <h3 className="mt-2 text-base font-semibold text-zinc-100">Choose local orientation</h3>
          </div>
          {trusted ? <LockHint label="Saved on device" /> : <LockHint label="Browse only" />}
        </div>
        <div className="mt-4 space-y-3">
          {VITAE_PATHS.map((path) => {
            const active = selectedPath?.key === path.key;
            return (
              <button
                key={path.key}
                type="button"
                onClick={() => void onChoosePath(path.key)}
                className={cn(
                  'w-full rounded-2xl border px-4 py-3 text-left transition-colors',
                  active ? 'border-amber-300/35 bg-amber-300/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-zinc-100">{path.title}</div>
                  {active ? <LockHint label="Active" /> : null}
                </div>
                <p className="mt-2 text-sm text-zinc-300">{path.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {path.emphasis.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-zinc-300">
                      {item}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-zinc-500">Current session band: {summary.band} · {summary.sessionCount} sessions tracked locally.</div>
      </div>
    </div>
  );
}

function StateCard({ trusted, state, summary }: { trusted: boolean; state: VitaeState; summary: ReturnType<typeof summarizeVitae> }) {
  const status = !trusted ? 'Browse only' : state.sessions.length === 0 ? 'Ready' : 'Active';
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">State readout</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Reliability without pressure</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="State" value={status} />
          <MetricTile label="Band" value={summary.band} />
          <MetricTile label="Sessions" value={String(summary.sessionCount)} />
          <MetricTile label="Minutes" value={String(summary.totalMinutes)} />
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
          {trusted
            ? 'This device can hold a local Vitae memory. It can remember your orientation, sessions, and factual timing context without converting any of it into rank or worth.'
            : 'This device is still in browse mode. The module remains visible, but local memory and recorded continuity stay unavailable until setup is complete.'}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Phase notes</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Current state meanings</h3>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <StateNote title="Ready">The shell is visible and the curriculum map can be explored safely.</StateNote>
          <StateNote title="Active">Local continuity exists. Sessions and evidence are accumulating on this device.</StateNote>
          <StateNote title="Paused / silent">A later runtime registry can name pauses, stalls, or privacy windows without treating them as failure.</StateNote>
          <StateNote title="Browse only">Orientation is visible, but local recording is intentionally withheld.</StateNote>
        </div>
      </div>
    </div>
  );
}

function ThresholdCard({
  selectedPath,
  summary,
  visibleGrades,
}: {
  selectedPath: (typeof VITAE_PATHS)[number] | null;
  summary: ReturnType<typeof summarizeVitae>;
  visibleGrades: number;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Next threshold</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">What opens next</h3>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <ThresholdLine label="Current path" value={selectedPath?.title ?? 'Choose one local orientation'} />
          <ThresholdLine label="Visible map" value={`${visibleGrades} core grades + 10 specializations`} />
          <ThresholdLine label="Next implementation target" value="grade / class / chapter registry" />
          <ThresholdLine label="Longer threshold" value="consent-aware progression signals without gamification" />
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Guidance</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Threshold notes</h3>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <p>Thresholds in Vitae should communicate readiness and visibility, not challenge or prestige.</p>
          <p>The current local record can support continuity, but it does not yet truthfully claim which grade, class, or chapter has stabilized.</p>
          <p>Until the curriculum registry is expanded, this card should function as an honest threshold notice rather than a false advancement display.</p>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-amber-100">
            Current continuity band: {summary.band}. This remains a local memory aid, not canonical recognition.
          </div>
        </div>
      </div>
    </div>
  );
}

function CoreLadderCard() {
  return (
    <div className="space-y-4">
      {VITAE_SCHOOLS.map((school) => (
        <section key={school.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{school.title}</div>
              <h3 className="mt-2 text-base font-semibold text-zinc-100">{school.purpose}</h3>
            </div>
            <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">{school.grades.length} grades</div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {school.grades.map((grade) => (
              <article key={grade.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Grade {grade.number}</div>
                <h4 className="mt-2 text-sm font-medium text-zinc-100">{grade.title}</h4>
                <p className="mt-2 text-sm text-amber-200/90">{grade.function}</p>
                <p className="mt-2 text-sm text-zinc-300">{grade.summary}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function AtlasCard() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Atlas scaffold</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Whole-journey view</h3>
        <p className="mt-4 text-sm text-zinc-300">
          This card is the placeholder for the fuller Vitae atlas: tree of life, constellation view, luminous grade map, and the larger school-to-specialization journey.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <AtlasNode title="Elementary" note="Foundation and stabilization" />
          <AtlasNode title="Intermediate" note="Complexity and integration" />
          <AtlasNode title="High / Adept" note="Creation and threshold" />
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Map notes</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">How this should evolve</h3>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <p>The atlas should be exploratory, not prescriptive.</p>
          <p>It can reveal the full architecture while still gating access to what is not yet visible or appropriate.</p>
          <p>Eventually this is where grades, classes, chapters, and threshold chambers can be browsed as a living library rather than a completion rail.</p>
        </div>
      </div>
    </div>
  );
}

function SpecializationsCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Specializations</div>
          <h3 className="mt-2 text-base font-semibold text-zinc-100">Adjacent stewardship domains</h3>
        </div>
        <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">Non-hierarchical</div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {VITAE_SPECIALIZATIONS.map((item) => (
          <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h4 className="text-sm font-medium text-zinc-100">{item.title}</h4>
            <p className="mt-2 text-sm text-amber-200/90">{item.mandate}</p>
            <p className="mt-2 text-sm text-zinc-300">Domain: {item.domain}</p>
            <p className="mt-2 text-xs text-zinc-500">Risk: {item.risk}</p>
            <p className="mt-1 text-xs text-zinc-500">Safeguard: {item.safeguard}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function PracticeShelfCard({ trusted, onQuickRecord }: { trusted: boolean; onQuickRecord: (practiceId: string) => void | Promise<void> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,.92fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Practice shelf</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">Extractive return points</h3>
        <div className="mt-4 space-y-3">
          {VITAE_PRACTICES.map((practice) => (
            <button
              key={practice.id}
              type="button"
              onClick={() => void onQuickRecord(practice.id)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-zinc-100">{practice.title}</h4>
                <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-400">{practice.suggestedMinutes} min</div>
              </div>
              <p className="mt-2 text-sm text-zinc-300">{practice.summary}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Usage</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">How the shelf should behave</h3>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <p>Practices here should feel like saved return points, not extracted trophies.</p>
          <p>Over time the shelf can separate favorited practices, repeated practices, and practices tied to specific thresholds or grades.</p>
          {!trusted ? <CTAActivate /> : null}
        </div>
      </div>
    </div>
  );
}

function EvidenceCard({ state }: { state: VitaeState }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Evidence</div>
          <h3 className="mt-2 text-base font-semibold text-zinc-100">Local continuity record</h3>
        </div>
        <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">{state.sessions.length} entries</div>
      </div>
      <div className="mt-4 space-y-3">
        {state.sessions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">No local Vitae evidence has been recorded yet.</div>
        ) : (
          state.sessions.slice(0, 8).map((session) => {
            const practice = VITAE_PRACTICES.find((item) => item.id === session.practiceId);
            return (
              <article key={session.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>{practice?.title ?? session.practiceId}</span>
                  <span>•</span>
                  <span>{session.minutes} min</span>
                  <span>•</span>
                  <span>{new Date(session.completedAt).toLocaleString()}</span>
                </div>
                {session.notes ? <p className="mt-2 text-sm text-zinc-300">{session.notes}</p> : null}
                {session.tempusContext ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
                    Tempus context · {session.tempusContext.solar.season} · {session.tempusContext.lunar.phase} · {session.tempusContext.zodiac.sign}
                  </div>
                ) : null}
                {session.ritesCreditId ? (
                  <div className="mt-2 rounded-xl border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs text-amber-100">
                    Local RITES credit recorded.
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function PermissionsCard({ trusted, summary }: { trusted: boolean; summary: ReturnType<typeof summarizeVitae> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Current permissions</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">What this device can hold</h3>
        <div className="mt-4 space-y-3">
          <PermissionRow label="Local orientation memory" value={trusted ? 'Allowed' : 'Unavailable'} />
          <PermissionRow label="Practice logging" value={trusted ? 'Allowed' : 'Unavailable'} />
          <PermissionRow label="Factual Tempus attachment" value={trusted ? 'Allowed' : 'Unavailable'} />
          <PermissionRow label="Local non-transferable RITES memory" value={trusted ? 'Allowed' : 'Unavailable'} />
          <PermissionRow label="Stewardship / authority" value="Not granted here" />
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Guardrails</div>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">What Vitae must not become</h3>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <p>No score, leaderboard, or superiority language should be generated from this record.</p>
          <p>Stewardship remains invited, not claimed. Permissions here are local and administrative, not spiritual or hierarchical.</p>
          <p>Current continuity band: {summary.band}. This is a private aid to memory and rhythm, not recognition.</p>
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

function ThresholdLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</div>
      <div className="text-right text-sm text-zinc-100">{value}</div>
    </div>
  );
}

function AtlasNode({ title, note }: { title: string; note: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-medium text-zinc-100">{title}</div>
      <div className="mt-2 text-sm text-zinc-300">{note}</div>
    </div>
  );
}

function PermissionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-sm text-zinc-300">{label}</div>
      <div className="text-sm text-zinc-100">{value}</div>
    </div>
  );
}
