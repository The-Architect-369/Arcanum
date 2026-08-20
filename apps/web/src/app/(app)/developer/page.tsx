import Link from 'next/link'
import ArchitectRuntimeWorkspace from '@/components/developer/ArchitectRuntimeWorkspace'
import AppStage from '@/components/ui/AppStage'
import PanelShell, { PanelSection } from '@/components/ui/PanelShell'

const INTERNAL_SURFACES = [
  {
    href: '/intelligence/codex',
    title: 'Codex dry run',
    status: 'disabled provider',
    description:
      'Inspect the first Codex interpretation record shape using approved repo/system sources only.',
  },
] as const

export default function DeveloperPage() {
  return (
    <AppStage>
      <PanelShell title="Architect Workbench" flush className="min-h-0 flex-1">
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-amber-100">Human Architect development surface</p>
                <p className="mt-1 max-w-3xl text-xs leading-relaxed text-zinc-400">
                  The Workbench now combines a private local mission and review runtime with the separately
                  started Termux broker. Planning decisions remain local and do not grant agent execution,
                  governance authority, repository publication, MANA movement, or chain-state mutation.
                </p>
              </div>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-amber-200">
                Pre-Genesis
              </span>
            </div>
          </div>

          <PanelSection title="Architect runtime and local execution">
            <ArchitectRuntimeWorkspace />
          </PanelSection>

          <PanelSection title="Additional internal surfaces">
            <div className="grid gap-3 md:grid-cols-2">
              {INTERNAL_SURFACES.map((surface) => (
                <Link
                  key={surface.href}
                  href={surface.href}
                  className="rounded-xl border border-white/10 bg-black/30 p-3 transition-colors hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-zinc-100">{surface.title}</div>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400">{surface.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[10px] uppercase tracking-wide text-amber-200">
                      {surface.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Activation boundary">
            <div className="space-y-2 text-sm text-zinc-300">
              <p>
                Review-queue approval means approved for planning only. Every broker command still requires a
                separate, fresh Human Architect confirmation and accepts no browser-provided arguments.
              </p>
              <p className="text-xs text-zinc-500">
                Autonomous agents, repository writes, unrestricted terminal input, external model providers,
                deployments, chain actions, and background execution remain deferred capabilities.
              </p>
            </div>
          </PanelSection>
        </div>
      </PanelShell>
    </AppStage>
  )
}
