import type { IntelligenceExecutionPolicy, IntelligenceRoleContract } from './types'

export const PRE_GENESIS_INTELLIGENCE_POLICY: IntelligenceExecutionPolicy = {
  interpretationAllowed: true,
  draftGenerationAllowed: true,
  recommendationAllowed: true,
  autonomousExecutionAllowed: false,
  transactionSigningAllowed: false,
  manaMovementAllowed: false,
  governanceActionAllowed: false,
  repositoryWriteRequiresExplicitRequest: true,
}

export const INTELLIGENCE_ROLE_CONTRACTS: IntelligenceRoleContract[] = [
  {
    layer: 'hope',
    purpose: 'Personal reflective guidance and doctrine-aware user support.',
    allowed: [
      'reflective prompts',
      'doctrine explanation',
      'user-owned summaries',
      'consent-based handoff preparation',
    ],
    forbidden: [
      'identity_scoring',
      'vitae_acceleration',
      'silent_surveillance',
      'transaction_signing',
      'mana_movement',
    ],
  },
  {
    layer: 'codex',
    purpose: 'Interpretive synthesis of approved system signals and review-ready recommendations.',
    allowed: [
      'system state summaries',
      'confidence-labeled pattern translation',
      'doctrinal tension detection',
      'non-binding recommendations',
    ],
    forbidden: [
      'autonomous_execution',
      'governance_action',
      'identity_scoring',
      'transaction_signing',
      'mana_movement',
    ],
  },
  {
    layer: 'architect',
    purpose: 'Internal builder interface for repository analysis, implementation planning, and explicit patch work.',
    allowed: [
      'repository analysis',
      'patch drafting',
      'build diagnostics',
      'doctrine alignment review',
    ],
    forbidden: [
      'governance_action',
      'repository_write_without_request',
      'transaction_signing',
      'mana_movement',
    ],
  },
  {
    layer: 'agent',
    purpose: 'Future bounded worker surface; disabled by default during Pre-Genesis.',
    allowed: [
      'dry-run records',
      'manual invocation definitions',
      'disabled schedule declarations',
    ],
    forbidden: [
      'autonomous_execution',
      'governance_action',
      'repository_write_without_request',
      'transaction_signing',
      'mana_movement',
    ],
  },
]

export function assertPreGenesisExecutionAllowed(policy = PRE_GENESIS_INTELLIGENCE_POLICY): void {
  if (policy.autonomousExecutionAllowed) {
    throw new Error('Pre-Genesis policy violation: autonomous execution is forbidden.')
  }

  if (policy.transactionSigningAllowed) {
    throw new Error('Pre-Genesis policy violation: transaction signing is forbidden.')
  }

  if (policy.manaMovementAllowed) {
    throw new Error('Pre-Genesis policy violation: MANA movement is forbidden.')
  }

  if (policy.governanceActionAllowed) {
    throw new Error('Pre-Genesis policy violation: governance action is forbidden.')
  }
}
