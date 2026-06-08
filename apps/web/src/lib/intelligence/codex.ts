import { disabledProviderAdapter } from './adapters'
import { assertSourcesApprovedForCodex, createInterpretationRecord } from './records'
import type {
  CodexDryRunInput,
  IntelligenceProviderAdapter,
  IntelligencePrompt,
  InterpretationRecord,
} from './types'

function createCodexPrompt(input: CodexDryRunInput): IntelligencePrompt {
  return {
    id: `${input.id}:prompt`,
    layer: 'codex',
    intent: 'summarize',
    content: input.prompt,
    sources: input.sources,
    createdAt: input.createdAt ?? new Date().toISOString(),
  }
}

export async function runCodexDryRun(
  input: CodexDryRunInput,
  provider: IntelligenceProviderAdapter = disabledProviderAdapter,
): Promise<InterpretationRecord> {
  assertSourcesApprovedForCodex(input.sources)

  const prompt = createCodexPrompt(input)
  const response = await provider.interpret(prompt)

  return createInterpretationRecord({
    id: input.id,
    layer: 'codex',
    sources: input.sources,
    summary: response.summary,
    recommendations: response.recommendations,
    confidence: response.confidence,
    createdAt: input.createdAt,
  })
}
