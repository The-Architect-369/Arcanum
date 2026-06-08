export type IntelligenceLayer = 'hope' | 'codex' | 'architect' | 'agent'

export type IntelligenceRecordStatus =
  | 'draft'
  | 'review_required'
  | 'approved'
  | 'rejected'

export type IntelligenceSourceKind =
  | 'user_private'
  | 'user_approved'
  | 'repo_public'
  | 'repo_internal'
  | 'chain_public'
  | 'app_local'
  | 'system_generated'

export type ForbiddenAction =
  | 'autonomous_execution'
  | 'transaction_signing'
  | 'mana_movement'
  | 'governance_action'
  | 'identity_scoring'
  | 'vitae_acceleration'
  | 'silent_surveillance'
  | 'repository_write_without_request'

export type IntelligenceSource = {
  id: string
  kind: IntelligenceSourceKind
  label: string
  uri?: string
  approvedByUser: boolean
  capturedAt: string
}

export type InterpretationRecord = {
  id: string
  layer: IntelligenceLayer
  status: IntelligenceRecordStatus
  sources: IntelligenceSource[]
  summary: string
  recommendations: string[]
  forbiddenActions: ForbiddenAction[]
  confidence: 'low' | 'medium' | 'high'
  createdAt: string
}

export type IntelligenceExecutionPolicy = {
  interpretationAllowed: boolean
  draftGenerationAllowed: boolean
  recommendationAllowed: boolean
  autonomousExecutionAllowed: boolean
  transactionSigningAllowed: boolean
  manaMovementAllowed: boolean
  governanceActionAllowed: boolean
  repositoryWriteRequiresExplicitRequest: boolean
}

export type IntelligenceRoleContract = {
  layer: IntelligenceLayer
  purpose: string
  allowed: string[]
  forbidden: ForbiddenAction[]
}

export type IntelligenceProviderMode = 'online' | 'local' | 'hybrid' | 'disabled'

export type IntelligenceProviderDescriptor = {
  id: string
  mode: IntelligenceProviderMode
  label: string
  requiresNetwork: boolean
  storesDataExternally: boolean
  userConsentRequired: boolean
}

export type IntelligencePrompt = {
  id: string
  layer: IntelligenceLayer
  intent: 'reflect' | 'summarize' | 'audit' | 'recommend' | 'explain'
  content: string
  sources: IntelligenceSource[]
  createdAt: string
}

export type IntelligenceProviderResponse = {
  providerId: string
  promptId: string
  summary: string
  recommendations: string[]
  confidence: InterpretationRecord['confidence']
  rawText?: string
}

export type IntelligenceProviderAdapter = {
  descriptor: IntelligenceProviderDescriptor
  interpret(prompt: IntelligencePrompt): Promise<IntelligenceProviderResponse>
}

export type CodexDryRunInput = {
  id: string
  sources: IntelligenceSource[]
  prompt: string
  createdAt?: string
}

export type AgentActivationState = 'disabled' | 'dry_run_only' | 'manual_review' | 'active'

export type IntelligenceAgentDefinition = {
  id: string
  label: string
  layer: 'agent'
  activationState: AgentActivationState
  purpose: string
  allowedInputs: IntelligenceSourceKind[]
  forbiddenActions: ForbiddenAction[]
  tempusWindow?: string
}
