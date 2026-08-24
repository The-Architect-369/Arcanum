'use client';

import { useMemo, useState } from 'react';
import {
  CAPABILITY_STATES,
  createEmptyCapabilityFacts,
  evaluateCapability,
  satisfyEligibilityEvidence,
  type CapabilityFacts,
  type CapabilityPolicy,
  type CapabilityState,
} from '@/lib/capabilities/evaluator';
import {
  CAPABILITY_POLICIES,
  getCapabilityPolicy,
  type CapabilityPolicyId,
} from '@/lib/capabilities/policies';

const STATE_INDEX: Record<CapabilityState, number> = {
  INELIGIBLE: 0,
  ELIGIBLE: 1,
  REVIEWED: 2,
  GRANTED: 3,
  ACTIVE: 4,
  SUSPENDED: 5,
  EXPIRED: 6,
};

function stateClass(state: CapabilityState) {
  if (state === 'ACTIVE') return 'border-emerald-400/60 bg-emerald-400/10 text-emerald-100';
  if (state === 'SUSPENDED' || state === 'EXPIRED') {
    return 'border-amber-400/60 bg-amber-400/10 text-amber-100';
  }
  if (state === 'INELIGIBLE') return 'border-zinc-700 bg-zinc-950 text-zinc-300';
  return 'border-sky-400/50 bg-sky-400/10 text-sky-100';
}

function GeometryBridge({ state }: { state: CapabilityState }) {
  const index = STATE_INDEX[state];
  const vitaeOpacity = index <= 1 ? 1 : index === 2 ? 0.62 : 0.28;
  const junctionOpacity = index >= 1 && index <= 3 ? 1 : index >= 4 ? 0.58 : 0.34;
  const arcnetOpacity = index >= 3 ? 1 : index === 2 ? 0.55 : 0.26;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-black/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">Explainable geometry</div>
          <div className="mt-1 text-sm text-zinc-300">
            Vitae evidence → octahedral review context → ARCnet verb
          </div>
        </div>
        <div className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
          geometry never grants
        </div>
      </div>

      <svg viewBox="0 0 780 280" className="h-auto w-full text-zinc-200" role="img" aria-label="Vitae to ARCnet evaluator geometry">
        <defs>
          <marker id="cap-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="currentColor" />
          </marker>
        </defs>

        <g opacity={vitaeOpacity} className="transition-opacity duration-300">
          <text x="122" y="28" textAnchor="middle" fontSize="14" fill="currentColor">VITAE</text>
          <text x="122" y="47" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".62">20-face developmental field</text>
          <g transform="translate(122 144)" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="0,-82 52,-26 32,64 -32,64 -52,-26" />
            <polygon points="0,82 52,26 32,-64 -32,-64 -52,26" />
            <line x1="0" y1="-82" x2="52" y2="26" />
            <line x1="0" y1="-82" x2="-52" y2="26" />
            <line x1="0" y1="82" x2="52" y2="-26" />
            <line x1="0" y1="82" x2="-52" y2="-26" />
            <line x1="-52" y1="-26" x2="52" y2="-26" />
            <line x1="-52" y1="26" x2="52" y2="26" />
            <circle cx="0" cy="-82" r="3" fill="currentColor" />
            <circle cx="0" cy="82" r="3" fill="currentColor" />
            <circle cx="52" cy="-26" r="3" fill="currentColor" />
            <circle cx="-52" cy="-26" r="3" fill="currentColor" />
            <circle cx="52" cy="26" r="3" fill="currentColor" />
            <circle cx="-52" cy="26" r="3" fill="currentColor" />
          </g>
        </g>

        <line x1="205" y1="144" x2="304" y2="144" stroke="currentColor" opacity=".45" markerEnd="url(#cap-arrow)" />

        <g opacity={junctionOpacity} className="transition-opacity duration-300">
          <text x="390" y="28" textAnchor="middle" fontSize="14" fill="currentColor">OCTAHEDRON</text>
          <text x="390" y="47" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".62">review / coordination projection</text>
          <g transform="translate(390 144)" fill="none" stroke="currentColor" strokeWidth="1.7">
            <polygon points="0,-82 72,0 0,82 -72,0" />
            <line x1="0" y1="-82" x2="0" y2="82" />
            <line x1="-72" y1="0" x2="72" y2="0" />
            <line x1="0" y1="-82" x2="34" y2="0" opacity=".5" />
            <line x1="0" y1="82" x2="-34" y2="0" opacity=".5" />
            <circle cx="0" cy="-82" r="4" fill="currentColor" />
            <circle cx="0" cy="82" r="4" fill="currentColor" />
            <circle cx="-72" cy="0" r="4" fill="currentColor" />
            <circle cx="72" cy="0" r="4" fill="currentColor" />
            <circle cx="-34" cy="0" r="4" fill="currentColor" />
            <circle cx="34" cy="0" r="4" fill="currentColor" />
          </g>
        </g>

        <line x1="476" y1="144" x2="576" y2="144" stroke="currentColor" opacity=".45" markerEnd="url(#cap-arrow)" />

        <g opacity={arcnetOpacity} className="transition-opacity duration-300">
          <text x="664" y="28" textAnchor="middle" fontSize="14" fill="currentColor">ARCNET</text>
          <text x="664" y="47" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".62">bounded system verb</text>
          <g transform="translate(664 144)" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="-58" y="-58" width="94" height="94" />
            <rect x="-34" y="-34" width="94" height="94" />
            <line x1="-58" y1="-58" x2="-34" y2="-34" />
            <line x1="36" y1="-58" x2="60" y2="-34" />
            <line x1="-58" y1="36" x2="-34" y2="60" />
            <line x1="36" y1="36" x2="60" y2="60" />
            <line x1="-58" y1="-58" x2="60" y2="60" />
            <line x1="36" y1="-58" x2="-34" y2="60" />
            <line x1="-34" y1="-34" x2="36" y2="36" />
            <line x1="60" y1="-34" x2="-58" y2="36" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function setAllEvidence(
  policy: CapabilityPolicy,
  facts: CapabilityFacts,
  value: boolean,
): CapabilityFacts {
  const evidence = { ...facts.evidence };
  for (const group of policy.evidenceGroups) {
    for (const item of group.items) evidence[item.id] = value;
  }
  return { ...facts, evidence };
}

export function CapabilityEvaluatorDemo() {
  const [capabilityId, setCapabilityId] = useState<CapabilityPolicyId>(
    'protection.market-assurance.review',
  );
  const policy = getCapabilityPolicy(capabilityId);
  const [facts, setFacts] = useState<CapabilityFacts>(() => createEmptyCapabilityFacts(policy));

  const evaluation = useMemo(() => evaluateCapability(policy, facts), [policy, facts]);

  function chooseCapability(id: CapabilityPolicyId) {
    const nextPolicy = getCapabilityPolicy(id);
    setCapabilityId(id);
    setFacts(createEmptyCapabilityFacts(nextPolicy));
  }

  function activateDemo() {
    const eligible = satisfyEligibilityEvidence(policy, createEmptyCapabilityFacts(policy));
    setFacts({
      ...eligible,
      reviewPassed: true,
      explicitGrant: true,
      actionRegistered: true,
      destinationAccepted: true,
      suspended: false,
      expiresAt: null,
    });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-[0.32em] text-zinc-500">Architecture-v2 design candidate</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
          Vitae → ARCnet capability evaluator
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-400">
          This surface evaluates action-specific evidence, review, grant, and execution predicates.
          It does not infer worth, unlock whole systems, or accept Grade position, titles, or geometry as authority.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <section className="space-y-5">
          <GeometryBridge state={evaluation.state} />

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">Capability</span>
                <select
                  value={capabilityId}
                  onChange={(event) => chooseCapability(event.target.value as CapabilityPolicyId)}
                  className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2.5 text-sm text-zinc-100"
                >
                  {CAPABILITY_POLICIES.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.system} · {candidate.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className={`rounded-2xl border px-4 py-3 text-center ${stateClass(evaluation.state)}`}>
                <div className="text-[10px] uppercase tracking-[0.26em] opacity-70">Evaluator state</div>
                <div className="mt-1 text-lg font-semibold">{evaluation.state}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={() => setFacts((current) => setAllEvidence(policy, current, true))}
                className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
              >
                Satisfy evidence
              </button>
              <button
                type="button"
                onClick={() => setFacts((current) => ({ ...current, reviewPassed: true }))}
                className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
              >
                Pass review
              </button>
              <button
                type="button"
                onClick={() => setFacts((current) => ({ ...current, explicitGrant: true }))}
                className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
              >
                Issue grant
              </button>
              <button
                type="button"
                onClick={activateDemo}
                className="rounded-xl border border-zinc-500 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
              >
                Make active
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  setFacts((current) => ({
                    ...current,
                    actionRegistered: true,
                    destinationAccepted: true,
                  }))
                }
                className="rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900"
              >
                Complete execution path
              </button>
              <button
                type="button"
                onClick={() => setFacts((current) => ({ ...current, suspended: !current.suspended }))}
                className="rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900"
              >
                {facts.suspended ? 'Clear suspension' : 'Suspend'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFacts((current) => ({
                    ...current,
                    expiresAt: current.expiresAt ? null : new Date(Date.now() - 60_000).toISOString(),
                  }))
                }
                className="rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900"
              >
                {facts.expiresAt ? 'Clear expiry' : 'Expire grant'}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Action-specific predicates</div>
                <div className="mt-1 text-sm text-zinc-300">{policy.humanIntent}</div>
              </div>
              <button
                type="button"
                onClick={() => setFacts(createEmptyCapabilityFacts(policy))}
                className="rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900"
              >
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {policy.evidenceGroups.map((group) => (
                <div key={group.id} className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{group.label}</div>
                      <div className="text-xs text-zinc-500">
                        {group.kind} · {group.operator === 'all' ? 'all required' : 'one or more required'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {group.items.map((item) => (
                      <label key={item.id} className="flex cursor-pointer gap-3 rounded-xl border border-zinc-900 px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={facts.evidence[item.id] === true}
                          onChange={(event) =>
                            setFacts((current) => ({
                              ...current,
                              evidence: { ...current.evidence, [item.id]: event.target.checked },
                            }))
                          }
                          className="mt-0.5 h-4 w-4"
                        />
                        <span className="text-sm text-zinc-400">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">State pipeline</div>
            <div className="mt-4 space-y-2">
              {CAPABILITY_STATES.map((state) => {
                const active = state === evaluation.state;
                const reached = STATE_INDEX[state] <= STATE_INDEX[evaluation.state] && STATE_INDEX[evaluation.state] <= 4;
                return (
                  <div
                    key={state}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                      active ? stateClass(state) : reached ? 'border-zinc-700 text-zinc-300' : 'border-zinc-900 text-zinc-600'
                    }`}
                  >
                    <span>{state}</span>
                    <span>{active ? 'current' : reached ? 'passed' : '—'}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">{evaluation.explanation}</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Blockers</div>
            <div className="mt-3 space-y-2">
              {evaluation.blockers.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 px-3 py-3 text-sm text-zinc-400">
                  No evaluator blockers remain.
                </div>
              ) : (
                evaluation.blockers.map((blocker) => (
                  <div key={blocker} className="rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-400">
                    {blocker}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Forbidden authority shortcuts</div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Toggle these deliberately. The evaluator records that they were present and ignores them.
            </p>
            <div className="mt-3 space-y-2">
              {[
                ['currentVitaePosition', 'Current Vitae face / navigation position'],
                ['gradeIndex', 'Grade index or illuminated Grade face'],
                ['achievementTitle', 'Architect / Wizard / Magus title'],
                ['geometryAlignment', 'Icosahedron / junction / cube alignment'],
              ].map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-900 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={facts.forbiddenSignals?.[key as keyof NonNullable<CapabilityFacts['forbiddenSignals']>] === true}
                    onChange={(event) =>
                      setFacts((current) => ({
                        ...current,
                        forbiddenSignals: {
                          ...current.forbiddenSignals,
                          [key]: event.target.checked,
                        },
                      }))
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-zinc-400">{label}</span>
                </label>
              ))}
            </div>
            {evaluation.ignoredAuthoritySignals.length > 0 && (
              <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="text-xs font-medium text-amber-100">Ignored as authorization input</div>
                <ul className="mt-2 space-y-1 text-xs text-amber-100/70">
                  {evaluation.ignoredAuthoritySignals.map((signal) => <li key={signal}>· {signal}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Review geometry context</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {evaluation.junctionContext.length === 0 ? (
                <span className="text-sm text-zinc-500">No junction context required.</span>
              ) : (
                evaluation.junctionContext.map((junction) => (
                  <span key={junction} className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                    {junction}
                  </span>
                ))
              )}
            </div>
            <div className="mt-4 border-t border-zinc-800 pt-4 text-xs leading-5 text-zinc-500">
              Edge Contract: {evaluation.edgeContractRequired ? 'required for this profile' : 'not required by this profile'}.
              <br />
              {policy.authorityNote}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
