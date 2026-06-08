import AppStage from "@/components/ui/AppStage";
import PanelShell, { PanelSection } from "@/components/ui/PanelShell";
import {
  INTELLIGENCE_AGENT_REGISTRY,
  INTELLIGENCE_PROVIDERS,
  runCodexDryRun,
  type IntelligenceSource,
} from "@/lib/intelligence";

const DEMO_SOURCES: IntelligenceSource[] = [
  {
    id: "source:intelligence-contract",
    kind: "repo_public",
    label: "docs/specs/intelligence/intelligence-layer-contract.md",
    uri: "docs/specs/intelligence/intelligence-layer-contract.md",
    approvedByUser: true,
    capturedAt: "2026-06-08T00:00:00.000Z",
  },
  {
    id: "source:pre-genesis-policy",
    kind: "system_generated",
    label: "Pre-Genesis intelligence execution policy",
    approvedByUser: true,
    capturedAt: "2026-06-08T00:00:00.000Z",
  },
];

export default async function CodexDryRunPage() {
  const record = await runCodexDryRun({
    id: "codex-dev-dry-run-001",
    sources: DEMO_SOURCES,
    prompt:
      "Summarize the current intelligence-layer boundary without invoking a live model or executing any action.",
    createdAt: "2026-06-08T00:00:00.000Z",
  });

  return (
    <AppStage>
      <PanelShell title="Codex — Dry Run" flush className="min-h-0 flex-1">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            This internal Pre-Genesis surface renders a Codex interpretation record using only approved
            repository/system sources. The active provider is disabled, so no online model is called and no
            autonomous action is possible.
          </p>

          <PanelSection title="Execution boundary">
            <div className="grid gap-3 md:grid-cols-3">
              <StatusCard label="Provider" value="disabled" />
              <StatusCard label="Record status" value={record.status} />
              <StatusCard label="Confidence" value={record.confidence} />
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Records are review artifacts only. They do not move MANA, sign transactions, write governance
              proposals, or mutate repository state.
            </p>
          </PanelSection>

          <PanelSection title="Sources">
            <div className="space-y-3">
              {record.sources.map((source) => (
                <div key={source.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">{source.kind}</div>
                  <div className="mt-1 text-sm text-zinc-100">{source.label}</div>
                  {source.uri && <div className="mt-1 text-xs text-zinc-400">{source.uri}</div>}
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Codex record">
            <div className="space-y-3 text-sm text-zinc-300">
              <p>{record.summary}</p>
              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Recommendations</div>
                <ul className="list-disc space-y-1 pl-5">
                  {record.recommendations.map((recommendation) => (
                    <li key={recommendation}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </PanelSection>

          <PanelSection title="Agent registry posture">
            <div className="grid gap-3 md:grid-cols-2">
              {INTELLIGENCE_AGENT_REGISTRY.map((agent) => (
                <div key={agent.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-sm font-medium text-zinc-100">{agent.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-amber-200/80">
                    {agent.activationState}
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">{agent.purpose}</p>
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Provider transition path">
            <div className="grid gap-3 md:grid-cols-3">
              {INTELLIGENCE_PROVIDERS.map((provider) => (
                <div key={provider.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-sm font-medium text-zinc-100">{provider.label}</div>
                  <div className="mt-1 text-xs text-zinc-400">mode: {provider.mode}</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    network: {provider.requiresNetwork ? "required" : "not required"}
                  </div>
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Raw review artifact">
            <pre className="max-h-80 overflow-auto rounded-xl bg-black/40 p-3 text-xs text-zinc-300">
              {JSON.stringify(record, null, 2)}
            </pre>
          </PanelSection>
        </div>
      </PanelShell>
    </AppStage>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-zinc-100">{value}</div>
    </div>
  );
}
