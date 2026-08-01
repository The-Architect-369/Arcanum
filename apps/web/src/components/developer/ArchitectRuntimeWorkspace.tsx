'use client'

import * as React from 'react'
import ArchitectWorkbench from '@/components/developer/ArchitectWorkbench'
import type { ArchitectExecutionReceipt } from '@/lib/architect/execution'
import {
  ARCHITECT_RUNTIME_STORAGE_KEY,
  createInitialArchitectRuntime,
  decideArchitectTask,
  parseArchitectRuntime,
  recordExecutionReceipt,
  resetArchitectRuntime,
  type ArchitectReviewTask,
  type ArchitectRuntimeSnapshot,
  type ArchitectTaskDecision,
} from '@/lib/architect/runtime'

function decisionLabel(decision: ArchitectTaskDecision): string {
  if (decision === 'approved_for_planning') return 'Approved for planning'
  if (decision === 'rejected') return 'Rejected'
  return 'Pending review'
}

function decisionClass(decision: ArchitectTaskDecision): string {
  if (decision === 'approved_for_planning') {
    return 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200'
  }
  if (decision === 'rejected') return 'border-rose-300/20 bg-rose-300/10 text-rose-200'
  return 'border-amber-300/20 bg-amber-300/10 text-amber-200'
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">{label}</div>
      <div className="mt-1 text-xl font-semibold text-zinc-100">{value}</div>
      <div className="mt-1 text-[11px] leading-relaxed text-zinc-500">{detail}</div>
    </div>
  )
}

function ReviewTaskCard({
  task,
  onDecision,
}: {
  task: ArchitectReviewTask
  onDecision: (taskId: string, decision: 'approved_for_planning' | 'rejected') => void
}) {
  return (
    <article className="rounded-xl border border-white/8 bg-black/30 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-medium text-zinc-100">{task.title}</h4>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${decisionClass(task.decision)}`}>
              {decisionLabel(task.decision)}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">{task.description}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-600">
            <span>Agent: {task.proposedBy}</span>
            <span>Domain: {task.domain}</span>
            <span>Ceiling: {task.requestedPermission}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onDecision(task.id, 'approved_for_planning')}
            className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-100 transition hover:bg-emerald-300/15"
          >
            Approve planning
          </button>
          <button
            type="button"
            onClick={() => onDecision(task.id, 'rejected')}
            className="rounded-lg border border-rose-300/20 bg-rose-300/10 px-2.5 py-1.5 text-[11px] font-medium text-rose-100 transition hover:bg-rose-300/15"
          >
            Reject
          </button>
        </div>
      </div>
    </article>
  )
}

export default function ArchitectRuntimeWorkspace() {
  const [snapshot, setSnapshot] = React.useState<ArchitectRuntimeSnapshot | null>(null)
  const [storageError, setStorageError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const now = new Date().toISOString()
    try {
      const stored = window.localStorage.getItem(ARCHITECT_RUNTIME_STORAGE_KEY)
      setSnapshot((stored && parseArchitectRuntime(stored)) || createInitialArchitectRuntime(now))
    } catch {
      setStorageError('Local runtime persistence is unavailable in this browser context.')
      setSnapshot(createInitialArchitectRuntime(now))
    }
  }, [])

  React.useEffect(() => {
    if (!snapshot) return
    try {
      window.localStorage.setItem(ARCHITECT_RUNTIME_STORAGE_KEY, JSON.stringify(snapshot))
      setStorageError(null)
    } catch {
      setStorageError('The runtime is active in memory, but its local snapshot could not be saved.')
    }
  }, [snapshot])

  const decideTask = React.useCallback(
    (taskId: string, decision: 'approved_for_planning' | 'rejected') => {
      setSnapshot((current) => (current ? decideArchitectTask(current, taskId, decision) : current))
    },
    [],
  )

  const recordReceipt = React.useCallback((receipt: ArchitectExecutionReceipt) => {
    setSnapshot((current) => (current ? recordExecutionReceipt(current, receipt) : current))
  }, [])

  const exportSnapshot = React.useCallback(() => {
    if (!snapshot) return
    const blob = new Blob([`${JSON.stringify(snapshot, null, 2)}\n`], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `architect-runtime-${snapshot.mission.wave.toLowerCase()}-${snapshot.updatedAt.replace(/[:.]/g, '-')}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [snapshot])

  const resetSnapshot = React.useCallback(() => {
    if (!window.confirm('Reset the local Architect mission, review decisions, receipt summaries, and audit history?')) return
    setSnapshot(resetArchitectRuntime())
  }, [])

  if (!snapshot) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-400">
        Loading local Architect runtime…
      </div>
    )
  }

  const pending = snapshot.tasks.filter((task) => task.decision === 'pending').length
  const approved = snapshot.tasks.filter((task) => task.decision === 'approved_for_planning').length
  const rejected = snapshot.tasks.filter((task) => task.decision === 'rejected').length

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-amber-200">
                Wave {snapshot.mission.wave}
              </span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-zinc-400">
                {snapshot.mission.phase}
              </span>
              <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-sky-200">
                {snapshot.mission.status}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-zinc-100">{snapshot.mission.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{snapshot.mission.objective}</p>
            <p className="mt-3 text-xs text-zinc-600">Updated {snapshot.updatedAt}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportSnapshot}
              className="rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-xs font-medium text-sky-100 transition hover:bg-sky-300/15"
            >
              Export local snapshot
            </button>
            <button
              type="button"
              onClick={resetSnapshot}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.06]"
            >
              Reset local runtime
            </button>
          </div>
        </div>
        {storageError && (
          <p className="mt-3 rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-3 text-xs text-rose-100">
            {storageError}
          </p>
        )}
      </section>

      <section>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Pending reviews" value={pending} detail="Awaiting the Human Architect." />
          <Metric label="Planning approvals" value={approved} detail="Approved only for review and planning." />
          <Metric label="Rejected proposals" value={rejected} detail="Declined locally; no action was executed." />
          <Metric label="Receipt summaries" value={snapshot.receipts.length} detail="Metadata only; raw output is not persisted." />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Human review queue</h3>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-zinc-400">
              These are bounded planning proposals from registered agents. Approval records intent to review;
              it does not invoke an agent, run a tool, modify the repository, or grant publication authority.
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-zinc-400">
            {snapshot.tasks.length} proposals
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {snapshot.tasks.map((task) => (
            <ReviewTaskCard key={task.id} task={task} onDecision={decideTask} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Registered Architect agents</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              The canonical Wave XVIII roster is visible for coordination. Every agent remains inactive and capped at R1.
            </p>
          </div>
          <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-sky-200">
            registry only
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.agents.map((agent) => (
            <article key={agent.id} className="rounded-xl border border-white/8 bg-black/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-medium text-zinc-100">{agent.displayName}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{agent.purpose}</p>
                </div>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase text-zinc-500">
                  {agent.permissionCeiling}
                </span>
              </div>
              <div className="mt-3 font-mono text-[10px] text-zinc-600">{agent.id}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-amber-200">{agent.state.replace('_', ' ')}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Local execution and receipt capture</h3>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-zinc-400">
            The Wave XXII broker remains the only execution surface. Full output stays in the active session;
            the runtime stores only bounded receipt identity, commit, status, duration, and hash metadata.
          </p>
        </div>
        <div className="mt-4">
          <ArchitectWorkbench onReceipt={recordReceipt} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <h3 className="text-sm font-semibold text-zinc-100">Receipt ledger</h3>
          <div className="mt-3 space-y-2">
            {snapshot.receipts.length === 0 ? (
              <p className="text-xs text-zinc-500">No receipt summaries have been recorded.</p>
            ) : (
              snapshot.receipts.slice(0, 10).map((receipt) => (
                <article key={receipt.receiptId} className="rounded-xl border border-white/8 bg-black/30 p-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-zinc-200">{receipt.commandLabel}</span>
                    <span className={receipt.status === 'pass' ? 'text-emerald-200' : 'text-rose-200'}>{receipt.status}</span>
                  </div>
                  <div className="mt-2 grid gap-1 text-[11px] text-zinc-500 sm:grid-cols-2">
                    <span>Exit {receipt.exitCode}</span>
                    <span>{receipt.durationMs} ms</span>
                    <span className="break-all font-mono sm:col-span-2">{receipt.resultSha256}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <h3 className="text-sm font-semibold text-zinc-100">Private local audit</h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            This history stays on the device unless the Human Architect exports the local snapshot.
          </p>
          <div className="mt-3 max-h-96 space-y-2 overflow-auto pr-1">
            {snapshot.audit.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-white/8 bg-black/30 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-zinc-600">
                  <span>{entry.kind.replaceAll('_', ' ')}</span>
                  <span>{entry.at}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-300">{entry.summary}</p>
                {entry.reference && <div className="mt-1 break-all font-mono text-[10px] text-zinc-600">{entry.reference}</div>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
