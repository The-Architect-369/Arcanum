'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import {
  CAPABILITY_POLICIES,
  getCapabilityPolicy,
  type CapabilityPolicyId,
} from '@/lib/capabilities/policies';
import {
  createVerifiableCapabilityDemoHarness,
  type VerifiableCapabilityDemoHarness,
  type VerifiableDemoMode,
} from '@/lib/capabilities/verifiable.demo';
import {
  evaluateVerifiableCapability,
  type VerifiableCapabilityEvaluation,
  type VerifiableCapabilityState,
} from '@/lib/capabilities/verifiable';

const MODE_LABELS: Array<[VerifiableDemoMode, string]> = [
  ['empty', 'No records'],
  ['eligible', 'Signed evidence'],
  ['reviewed', 'Signed review'],
  ['granted', 'Signed grant'],
  ['active', 'Destination accept'],
  ['suspended', 'Suspend'],
  ['revoked', 'Revoke'],
  ['expired', 'Expire grant'],
  ['tampered', 'Tamper evidence'],
];

function shortDigest(value: string | null, length = 18): string {
  if (!value) return '—';
  return value.length <= length ? value : `${value.slice(0, length)}…`;
}

function stateClass(state: VerifiableCapabilityState | null): string {
  if (state === 'ACTIVE') return 'border-emerald-400/60 bg-emerald-400/10 text-emerald-100';
  if (state === 'REVOKED') return 'border-rose-400/60 bg-rose-400/10 text-rose-100';
  if (state === 'SUSPENDED' || state === 'EXPIRED') {
    return 'border-amber-400/60 bg-amber-400/10 text-amber-100';
  }
  if (state === 'INELIGIBLE') return 'border-zinc-700 bg-zinc-950 text-zinc-300';
  return 'border-sky-400/50 bg-sky-400/10 text-sky-100';
}

function Pipeline({ state }: { state: VerifiableCapabilityState | null }) {
  const steps = ['signed evidence', 'signed review', 'bounded grant', 'destination check'];
  const activeIndex =
    state === 'INELIGIBLE' || state === null
      ? 0
      : state === 'ELIGIBLE'
        ? 1
        : state === 'REVIEWED'
          ? 2
          : state === 'GRANTED' || state === 'SUSPENDED' || state === 'REVOKED' || state === 'EXPIRED'
            ? 3
            : 4;

  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`rounded-2xl border px-3 py-3 text-xs ${
            index < activeIndex
              ? 'border-zinc-500 bg-zinc-100 text-zinc-950'
              : 'border-zinc-800 bg-black/30 text-zinc-500'
          }`}
        >
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">
            {index + 1}
          </div>
          <div className="mt-1 font-medium">{step}</div>
        </div>
      ))}
    </div>
  );
}

export function VerifiableCapabilityEvaluatorDemo() {
  const [capabilityId, setCapabilityId] = useState<CapabilityPolicyId>(
    'protection.market-assurance.review',
  );
  const [mode, setMode] = useState<VerifiableDemoMode>('empty');
  const [harness, setHarness] = useState<VerifiableCapabilityDemoHarness | null>(null);
  const [evaluation, setEvaluation] = useState<VerifiableCapabilityEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const policy = getCapabilityPolicy(capabilityId);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setHarness(null);
    setEvaluation(null);
    setMode('empty');

    createVerifiableCapabilityDemoHarness(policy)
      .then((nextHarness) => {
        if (!cancelled) setHarness(nextHarness);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Unable to build signed demo records.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [policy]);

  useEffect(() => {
    if (!harness) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    evaluateVerifiableCapability(policy, {
      subjectId: harness.subjectId,
      actionRequestId: harness.actionRequestId,
      trustAnchors: harness.trustAnchors,
      records: harness.recordsByMode[mode],
    })
      .then((nextEvaluation) => {
        if (!cancelled) {
          setEvaluation(nextEvaluation);
          setLoading(false);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Capability verification failed.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [harness, mode, policy]);

  function chooseCapability(id: CapabilityPolicyId) {
    setCapabilityId(id);
  }

  const currentRecords = harness?.recordsByMode[mode] ?? [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-[0.32em] text-zinc-500">
          Architecture-v2 design candidate · verifiable records v0.2
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
          Vitae → ARCnet verifiable capability evaluator
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-400">
          Authority state is now derived from signed, policy-bound records and trusted issuer anchors.
          Grade position, titles, geometry, and unsigned booleans are not authorization inputs.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <section className="space-y-5">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Capability
                </span>
                <select
                  value={capabilityId}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => chooseCapability(event.target.value as CapabilityPolicyId)}
                  className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2.5 text-sm text-zinc-100"
                >
                  {CAPABILITY_POLICIES.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.system} · {candidate.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className={`rounded-2xl border px-4 py-3 text-center ${stateClass(evaluation?.state ?? null)}`}>
                <div className="text-[10px] uppercase tracking-[0.26em] opacity-70">
                  Verified state
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {loading ? 'VERIFYING' : evaluation?.state ?? '—'}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <Pipeline state={evaluation?.state ?? null} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {MODE_LABELS.map(([candidateMode, label]) => {
                const lifecycleMode = candidateMode === 'suspended' || candidateMode === 'revoked' || candidateMode === 'expired';
                const disabled = lifecycleMode && !policy.grant.required;
                return (
                  <button
                    key={candidateMode}
                    type="button"
                    disabled={disabled}
                    onClick={() => setMode(candidateMode)}
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      mode === candidateMode
                        ? 'border-zinc-500 bg-zinc-100 text-zinc-950'
                        : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                    } disabled:cursor-not-allowed disabled:opacity-35`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Policy digest
                </div>
                <div className="mt-2 break-all font-mono text-xs text-zinc-300">
                  {harness?.policyDigest ?? 'generating…'}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Subject / request
                </div>
                <div className="mt-2 font-mono text-xs text-zinc-300">
                  {harness?.subjectId ?? '—'}
                </div>
                <div className="mt-1 font-mono text-xs text-zinc-500">
                  {harness?.actionRequestId ?? '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  Signed record ledger
                </div>
                <div className="mt-1 text-sm text-zinc-300">
                  {currentRecords.length} record{currentRecords.length === 1 ? '' : 's'} presented to the evaluator
                </div>
              </div>
              <div className="rounded-full border border-zinc-800 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                ES256 · SHA-256
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {(evaluation?.records ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">
                  No signed records are present.
                </div>
              ) : (
                evaluation?.records.map((check) => (
                  <div
                    key={`${check.recordId}:${check.digest}`}
                    className="grid gap-2 rounded-2xl border border-zinc-800 bg-black/30 p-4 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{check.kind}</div>
                      <div className="mt-1 break-all font-mono text-xs text-zinc-500">
                        {check.recordId}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        issuer {check.issuerId} · role {check.requiredRole}
                      </div>
                      {check.errors.length > 0 && (
                        <div className="mt-2 text-xs text-rose-300">
                          {check.errors.join(' · ')}
                        </div>
                      )}
                    </div>
                    <div className="text-left md:text-right">
                      <div className={`text-xs font-medium ${check.usable ? 'text-emerald-300' : check.integrityValid ? 'text-amber-300' : 'text-rose-300'}`}>
                        {check.usable ? 'VERIFIED' : check.integrityValid ? check.temporalStatus.toUpperCase() : 'INVALID'}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-zinc-600">
                        {shortDigest(check.digest)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Eligibility evidence groups
            </div>
            <div className="mt-4 space-y-3">
              {(evaluation?.evidenceGroups ?? []).map((group) => (
                <div key={group.id} className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{group.label}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {group.kind} · {group.operator}
                      </div>
                    </div>
                    <div className={group.satisfied ? 'text-xs text-emerald-300' : 'text-xs text-zinc-500'}>
                      {group.satisfied ? 'satisfied by verified receipts' : 'missing verified receipts'}
                    </div>
                  </div>
                  {group.selectedReceiptDigests.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.selectedReceiptDigests.map((digest) => (
                        <span
                          key={digest}
                          className="rounded-full border border-zinc-800 px-2 py-1 font-mono text-[10px] text-zinc-500"
                        >
                          {shortDigest(digest, 14)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Bound authority chain
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                ['Evidence set', evaluation?.evidenceSetDigest ?? null],
                ['Review', evaluation?.selectedReviewDigest ?? null],
                ['Grant', evaluation?.selectedGrantDigest ?? null],
                ['Action registration', evaluation?.selectedActionRegistrationDigest ?? null],
                ['Destination decision', evaluation?.selectedDestinationDecisionDigest ?? null],
              ].map(([label, digest]) => (
                <div key={label} className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                  <div className="text-xs text-zinc-500">{label}</div>
                  <div className="mt-1 break-all font-mono text-xs text-zinc-300">
                    {shortDigest(digest, 26)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Trusted issuer anchors
            </div>
            <div className="mt-4 space-y-3">
              {(harness?.trustAnchors ?? []).map((anchor) => (
                <div key={`${anchor.issuerId}:${anchor.keyId}`} className="rounded-2xl border border-zinc-800 bg-black/30 p-3">
                  <div className="text-sm font-medium text-zinc-200">{anchor.issuerId}</div>
                  <div className="mt-1 text-xs text-zinc-500">{anchor.roles.join(' · ')}</div>
                  <div className="mt-2 break-all font-mono text-[10px] text-zinc-600">
                    {shortDigest(anchor.keyFingerprint, 30)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Decision explanation
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {error ?? evaluation?.explanation ?? 'Generating ephemeral demonstration keys…'}
            </p>
            {(evaluation?.blockers ?? []).length > 0 && (
              <div className="mt-4 space-y-2">
                {evaluation?.blockers.map((blocker) => (
                  <div key={blocker} className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-xs text-zinc-400">
                    {blocker}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-amber-200/70">
              Prototype trust boundary
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              This page generates ephemeral P-256 signing keys in the browser and explicitly trusts their public anchors for the demo session.
              The signatures demonstrate tamper detection and record binding; they do not establish real-world issuer legitimacy.
            </p>
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              Production requires durable issuer registration, protected private-key custody, replay controls, revocation distribution,
              authority-source validation, and destination-owned policy enforcement.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Inputs that cannot authorize
            </div>
            <div className="mt-3 space-y-2">
              {(evaluation?.nonAuthorizingInputs ?? []).map((input) => (
                <div key={input} className="rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-400">
                  {input}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
