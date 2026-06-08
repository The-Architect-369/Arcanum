export type DeveloperAccessContext = {
  nodeEnv?: string
  architectMode?: boolean
  localNodeTrusted?: boolean
}

export type DeveloperAccessDecision = {
  allowed: boolean
  reason: 'development_mode' | 'architect_mode' | 'trusted_local_node' | 'production_hidden'
}

export function getDeveloperAccessDecision(
  context: DeveloperAccessContext = {},
): DeveloperAccessDecision {
  const nodeEnv = context.nodeEnv ?? process.env.NODE_ENV

  if (context.architectMode) {
    return { allowed: true, reason: 'architect_mode' }
  }

  if (context.localNodeTrusted) {
    return { allowed: true, reason: 'trusted_local_node' }
  }

  if (nodeEnv !== 'production') {
    return { allowed: true, reason: 'development_mode' }
  }

  return { allowed: false, reason: 'production_hidden' }
}

export function canAccessDeveloperSurface(context: DeveloperAccessContext = {}): boolean {
  return getDeveloperAccessDecision(context).allowed
}
