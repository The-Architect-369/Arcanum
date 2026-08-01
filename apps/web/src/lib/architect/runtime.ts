import type { ArchitectExecutionReceipt } from './execution'

export const ARCHITECT_RUNTIME_SCHEMA_VERSION = '1.0' as const
export const ARCHITECT_RUNTIME_STORAGE_KEY = 'arcanum:architect-runtime:v1'

const MAX_AUDIT_ENTRIES = 100
const MAX_RECEIPT_SUMMARIES = 50

export type ArchitectRuntimePhase = 'Pre-Genesis'
export type ArchitectMissionStatus = 'active' | 'paused' | 'complete'
export type ArchitectTaskDecision = 'pending' | 'approved_for_planning' | 'rejected'
export type ArchitectAgentState = 'registered_inactive'
export type ArchitectAuditKind =
  | 'runtime_initialized'
  | 'runtime_reset'
  | 'task_decision'
  | 'execution_receipt_recorded'

export type ArchitectMission = {
  id: string
  title: string
  objective: string
  wave: 'XXIII'
  phase: ArchitectRuntimePhase
  status: ArchitectMissionStatus
}

export type ArchitectReviewTask = {
  id: string
  title: string
  description: string
  domain: 'repository' | 'canon' | 'product' | 'security' | 'verification' | 'release'
  proposedBy: ArchitectAgentId
  requestedPermission: 'R1'
  decision: ArchitectTaskDecision
  decidedAt?: string
}

export type ArchitectAgentId =
  | 'repository_architect'
  | 'canon_guardian'
  | 'product_steward'
  | 'security_sentinel'
  | 'verification_oracle'
  | 'release_steward'

export type ArchitectAgentDescriptor = {
  id: ArchitectAgentId
  displayName: string
  purpose: string
  permissionCeiling: 'R1'
  state: ArchitectAgentState
}

export type ArchitectExecutionReceiptSummary = {
  receiptId: string
  commandId: string
  commandLabel: string
  status: 'pass' | 'fail'
  exitCode: number
  durationMs: number
  branch: string | null
  commitBefore: string | null
  commitAfter: string | null
  completedAt: string
  requestSha256: string
  resultSha256: string
}

export type ArchitectAuditEntry = {
  id: string
  at: string
  kind: ArchitectAuditKind
  summary: string
  reference?: string
}

export type ArchitectRuntimeSnapshot = {
  schemaVersion: typeof ARCHITECT_RUNTIME_SCHEMA_VERSION
  runtimeType: 'architect_runtime_local_snapshot'
  mission: ArchitectMission
  tasks: ArchitectReviewTask[]
  agents: ArchitectAgentDescriptor[]
  receipts: ArchitectExecutionReceiptSummary[]
  audit: ArchitectAuditEntry[]
  updatedAt: string
}

export const CANONICAL_ARCHITECT_AGENTS: readonly ArchitectAgentDescriptor[] = [
  {
    id: 'repository_architect',
    displayName: 'Repository Architect',
    purpose: 'Inspect repository structure, dependencies, implementation surfaces, and bounded change options.',
    permissionCeiling: 'R1',
    state: 'registered_inactive',
  },
  {
    id: 'canon_guardian',
    displayName: 'Canon Guardian',
    purpose: 'Review proposals for consistency with doctrine, governance, architecture, and constitutional boundaries.',
    permissionCeiling: 'R1',
    state: 'registered_inactive',
  },
  {
    id: 'product_steward',
    displayName: 'Product Steward',
    purpose: 'Translate system capabilities into coherent user outcomes, journeys, priorities, and measurable value.',
    permissionCeiling: 'R1',
    state: 'registered_inactive',
  },
  {
    id: 'security_sentinel',
    displayName: 'Security Sentinel',
    purpose: 'Identify permission, data-flow, secret-handling, prompt-injection, and confused-deputy risks.',
    permissionCeiling: 'R1',
    state: 'registered_inactive',
  },
  {
    id: 'verification_oracle',
    displayName: 'Verification Oracle',
    purpose: 'Evaluate evidence completeness, exact-head consistency, reproducibility, and release readiness.',
    permissionCeiling: 'R1',
    state: 'registered_inactive',
  },
  {
    id: 'release_steward',
    displayName: 'Release Steward',
    purpose: 'Prepare promotion and release coordination packages without exercising merge or deployment authority.',
    permissionCeiling: 'R1',
    state: 'registered_inactive',
  },
]

const INITIAL_TASKS: readonly Omit<ArchitectReviewTask, 'decision'>[] = [
  {
    id: 'review-runtime-architecture',
    title: 'Review the Architect Runtime Core',
    description: 'Inspect the local mission, review queue, persistence, audit, and receipt-minimization design.',
    domain: 'repository',
    proposedBy: 'repository_architect',
    requestedPermission: 'R1',
  },
  {
    id: 'review-authority-boundary',
    title: 'Review the authority boundary',
    description: 'Confirm that planning approval is not represented as execution, governance, merge, or deployment authority.',
    domain: 'canon',
    proposedBy: 'canon_guardian',
    requestedPermission: 'R1',
  },
  {
    id: 'review-workbench-journey',
    title: 'Review the Human Architect journey',
    description: 'Evaluate whether mission state, review decisions, agents, execution, and receipts are understandable in one surface.',
    domain: 'product',
    proposedBy: 'product_steward',
    requestedPermission: 'R1',
  },
  {
    id: 'review-runtime-threats',
    title: 'Review runtime privacy and security',
    description: 'Check local persistence, receipt minimization, browser-to-broker boundaries, and confused-deputy controls.',
    domain: 'security',
    proposedBy: 'security_sentinel',
    requestedPermission: 'R1',
  },
  {
    id: 'review-evidence-plan',
    title: 'Review the Wave XXIII evidence plan',
    description: 'Define the exact local fixture, typecheck, build, repository-index, and synchronization evidence required.',
    domain: 'verification',
    proposedBy: 'verification_oracle',
    requestedPermission: 'R1',
  },
  {
    id: 'prepare-release-checklist',
    title: 'Prepare the release coordination checklist',
    description: 'Summarize gates and the next Human Architect authorization without performing publication or promotion.',
    domain: 'release',
    proposedBy: 'release_steward',
    requestedPermission: 'R1',
  },
]

function auditId(kind: ArchitectAuditKind, at: string, reference?: string): string {
  const suffix = reference ? `:${reference}` : ''
  return `architect-audit:${kind}:${at}${suffix}`
}

function initialMission(): ArchitectMission {
  return {
    id: 'wave-xxiii-architect-runtime-core',
    title: 'Establish the accountable Architect runtime',
    objective:
      'Give the Human Architect one local surface for mission awareness, bounded planning reviews, registered agents, execution receipts, and private audit history.',
    wave: 'XXIII',
    phase: 'Pre-Genesis',
    status: 'active',
  }
}

export function createInitialArchitectRuntime(now = new Date().toISOString()): ArchitectRuntimeSnapshot {
  return {
    schemaVersion: ARCHITECT_RUNTIME_SCHEMA_VERSION,
    runtimeType: 'architect_runtime_local_snapshot',
    mission: initialMission(),
    tasks: INITIAL_TASKS.map((task) => ({ ...task, decision: 'pending' })),
    agents: CANONICAL_ARCHITECT_AGENTS.map((agent) => ({ ...agent })),
    receipts: [],
    audit: [
      {
        id: auditId('runtime_initialized', now),
        at: now,
        kind: 'runtime_initialized',
        summary: 'Architect Runtime Core initialized locally.',
      },
    ],
    updatedAt: now,
  }
}

export function resetArchitectRuntime(now = new Date().toISOString()): ArchitectRuntimeSnapshot {
  const snapshot = createInitialArchitectRuntime(now)
  return {
    ...snapshot,
    audit: [
      {
        id: auditId('runtime_reset', now),
        at: now,
        kind: 'runtime_reset',
        summary: 'Local Architect runtime state reset by the Human Architect.',
      },
    ],
  }
}

export function decideArchitectTask(
  snapshot: ArchitectRuntimeSnapshot,
  taskId: string,
  decision: Exclude<ArchitectTaskDecision, 'pending'>,
  now = new Date().toISOString(),
): ArchitectRuntimeSnapshot {
  const task = snapshot.tasks.find((candidate) => candidate.id === taskId)
  if (!task || task.decision === decision) return snapshot

  const nextTasks = snapshot.tasks.map((candidate) =>
    candidate.id === taskId ? { ...candidate, decision, decidedAt: now } : candidate,
  )
  const decisionLabel = decision === 'approved_for_planning' ? 'approved for planning review' : 'rejected'
  const entry: ArchitectAuditEntry = {
    id: auditId('task_decision', now, taskId),
    at: now,
    kind: 'task_decision',
    summary: `${task.title} ${decisionLabel}.`,
    reference: taskId,
  }

  return {
    ...snapshot,
    tasks: nextTasks,
    audit: [entry, ...snapshot.audit].slice(0, MAX_AUDIT_ENTRIES),
    updatedAt: now,
  }
}

export function summarizeExecutionReceipt(
  receipt: ArchitectExecutionReceipt,
): ArchitectExecutionReceiptSummary {
  return {
    receiptId: receipt.receiptId,
    commandId: receipt.command.id,
    commandLabel: receipt.command.label,
    status: receipt.status,
    exitCode: receipt.exitCode,
    durationMs: receipt.durationMs,
    branch: receipt.branch,
    commitBefore: receipt.commitBefore,
    commitAfter: receipt.commitAfter,
    completedAt: receipt.completedAt,
    requestSha256: receipt.requestSha256,
    resultSha256: receipt.resultSha256,
  }
}

export function recordExecutionReceipt(
  snapshot: ArchitectRuntimeSnapshot,
  receipt: ArchitectExecutionReceipt,
  now = new Date().toISOString(),
): ArchitectRuntimeSnapshot {
  if (snapshot.receipts.some((candidate) => candidate.receiptId === receipt.receiptId)) return snapshot

  const summary = summarizeExecutionReceipt(receipt)
  const entry: ArchitectAuditEntry = {
    id: auditId('execution_receipt_recorded', now, receipt.receiptId),
    at: now,
    kind: 'execution_receipt_recorded',
    summary: `${receipt.command.label} completed with ${receipt.status} status and exit code ${receipt.exitCode}.`,
    reference: receipt.receiptId,
  }

  return {
    ...snapshot,
    receipts: [summary, ...snapshot.receipts].slice(0, MAX_RECEIPT_SUMMARIES),
    audit: [entry, ...snapshot.audit].slice(0, MAX_AUDIT_ENTRIES),
    updatedAt: now,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseArchitectRuntime(raw: string): ArchitectRuntimeSnapshot | null {
  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value)) return null
    if (value.schemaVersion !== ARCHITECT_RUNTIME_SCHEMA_VERSION) return null
    if (value.runtimeType !== 'architect_runtime_local_snapshot') return null
    if (!isRecord(value.mission)) return null
    if (!Array.isArray(value.tasks) || !Array.isArray(value.agents)) return null
    if (!Array.isArray(value.receipts) || !Array.isArray(value.audit)) return null
    if (typeof value.updatedAt !== 'string') return null
    return value as unknown as ArchitectRuntimeSnapshot
  } catch {
    return null
  }
}
