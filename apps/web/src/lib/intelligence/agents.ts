import type { IntelligenceAgentDefinition } from './types'

const PRE_GENESIS_FORBIDDEN_AGENT_ACTIONS = [
  'autonomous_execution',
  'transaction_signing',
  'mana_movement',
  'governance_action',
  'repository_write_without_request',
] as const

export const INTELLIGENCE_AGENT_REGISTRY: IntelligenceAgentDefinition[] = [
  {
    id: 'codex-system-audit',
    label: 'Codex System Audit',
    layer: 'agent',
    activationState: 'dry_run_only',
    purpose: 'Prepare review-ready summaries of approved repository, chain, and app-local signals.',
    allowedInputs: ['repo_public', 'repo_internal', 'chain_public', 'app_local', 'system_generated'],
    forbiddenActions: [...PRE_GENESIS_FORBIDDEN_AGENT_ACTIONS],
    tempusWindow: 'manual-pre-genesis-review',
  },
  {
    id: 'hope-consent-handoff',
    label: 'Hope Consent Handoff',
    layer: 'agent',
    activationState: 'disabled',
    purpose: 'Future user-approved handoff preparation from Hope to Codex.',
    allowedInputs: ['user_approved'],
    forbiddenActions: [
      ...PRE_GENESIS_FORBIDDEN_AGENT_ACTIONS,
      'identity_scoring',
      'vitae_acceleration',
      'silent_surveillance',
    ],
    tempusWindow: 'disabled-until-consent-ui-exists',
  },
]

export function getIntelligenceAgentDefinition(id: string): IntelligenceAgentDefinition | undefined {
  return INTELLIGENCE_AGENT_REGISTRY.find((agent) => agent.id === id)
}

export function assertAgentIsNotAutonomous(agent: IntelligenceAgentDefinition): void {
  if (agent.activationState === 'active') {
    throw new Error(`Agent ${agent.id} is active. Active agents are forbidden during Pre-Genesis.`)
  }

  if (!agent.forbiddenActions.includes('autonomous_execution')) {
    throw new Error(`Agent ${agent.id} is missing the autonomous execution prohibition.`)
  }
}
