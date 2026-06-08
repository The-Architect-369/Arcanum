import { DISABLED_INTELLIGENCE_PROVIDER } from './providers'
import type {
  IntelligencePrompt,
  IntelligenceProviderAdapter,
  IntelligenceProviderResponse,
} from './types'

export const disabledProviderAdapter: IntelligenceProviderAdapter = {
  descriptor: DISABLED_INTELLIGENCE_PROVIDER,
  async interpret(prompt: IntelligencePrompt): Promise<IntelligenceProviderResponse> {
    return {
      providerId: DISABLED_INTELLIGENCE_PROVIDER.id,
      promptId: prompt.id,
      summary: 'Intelligence provider is disabled. This dry-run record contains no model-generated interpretation.',
      recommendations: [
        'Review source boundaries.',
        'Confirm user consent before any Codex handoff.',
        'Select an explicit provider before enabling model interpretation.',
      ],
      confidence: 'low',
    }
  },
}
