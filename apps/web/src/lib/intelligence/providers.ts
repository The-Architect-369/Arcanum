import type { IntelligenceProviderDescriptor } from './types'

export const DISABLED_INTELLIGENCE_PROVIDER: IntelligenceProviderDescriptor = {
  id: 'disabled',
  mode: 'disabled',
  label: 'Disabled intelligence provider',
  requiresNetwork: false,
  storesDataExternally: false,
  userConsentRequired: false,
}

export const DEVELOPMENT_ONLINE_PROVIDER: IntelligenceProviderDescriptor = {
  id: 'development-online',
  mode: 'online',
  label: 'Development online model provider',
  requiresNetwork: true,
  storesDataExternally: true,
  userConsentRequired: true,
}

export const FUTURE_LOCAL_PROVIDER: IntelligenceProviderDescriptor = {
  id: 'future-local',
  mode: 'local',
  label: 'Future local/offline model provider',
  requiresNetwork: false,
  storesDataExternally: false,
  userConsentRequired: false,
}

export const INTELLIGENCE_PROVIDERS: IntelligenceProviderDescriptor[] = [
  DISABLED_INTELLIGENCE_PROVIDER,
  DEVELOPMENT_ONLINE_PROVIDER,
  FUTURE_LOCAL_PROVIDER,
]
