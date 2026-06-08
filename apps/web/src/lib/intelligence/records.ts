import { PRE_GENESIS_INTELLIGENCE_POLICY, assertPreGenesisExecutionAllowed } from './policy'
import type {
  ForbiddenAction,
  IntelligenceLayer,
  IntelligenceSource,
  InterpretationRecord,
} from './types'

const DEFAULT_FORBIDDEN_ACTIONS: ForbiddenAction[] = [
  'autonomous_execution',
  'transaction_signing',
  'mana_movement',
  'governance_action',
]

export function createInterpretationRecord(input: {
  id: string
  layer: IntelligenceLayer
  sources: IntelligenceSource[]
  summary: string
  recommendations?: string[]
  forbiddenActions?: ForbiddenAction[]
  confidence?: InterpretationRecord['confidence']
  createdAt?: string
}): InterpretationRecord {
  assertPreGenesisExecutionAllowed(PRE_GENESIS_INTELLIGENCE_POLICY)

  return {
    id: input.id,
    layer: input.layer,
    status: 'review_required',
    sources: input.sources,
    summary: input.summary,
    recommendations: input.recommendations ?? [],
    forbiddenActions: Array.from(
      new Set([...(input.forbiddenActions ?? []), ...DEFAULT_FORBIDDEN_ACTIONS]),
    ),
    confidence: input.confidence ?? 'low',
    createdAt: input.createdAt ?? new Date().toISOString(),
  }
}

export function sourceRequiresUserApproval(source: IntelligenceSource): boolean {
  return source.kind === 'user_private' || source.kind === 'user_approved'
}

export function assertSourcesApprovedForCodex(sources: IntelligenceSource[]): void {
  const blocked = sources.filter(
    (source) => sourceRequiresUserApproval(source) && !source.approvedByUser,
  )

  if (blocked.length > 0) {
    const labels = blocked.map((source) => source.label).join(', ')
    throw new Error(`Codex handoff blocked. User approval required for: ${labels}`)
  }
}
