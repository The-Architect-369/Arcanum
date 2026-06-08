import Link from "next/link";
import AppStage from "@/components/ui/AppStage";
import PanelShell, { PanelSection } from "@/components/ui/PanelShell";

const INTERNAL_SURFACES = [
  {
    href: "/intelligence/codex",
    title: "Codex dry run",
    status: "disabled provider",
    description:
      "Inspect the first Codex interpretation record shape using approved repo/system sources only.",
  },
] as const;

export default function DeveloperPage() {
  return (
    <AppStage>
      <PanelShell title="Developer" flush className="min-h-0 flex-1">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Internal Pre-Genesis launch surface for implementation inspection. These tools are review
            artifacts only; they do not grant authority, execute agents, move MANA, sign transactions,
            or mutate chain/governance state.
          </p>

          <PanelSection title="Internal surfaces">
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
                Developer surfaces are currently navigational and diagnostic. Future access can be gated by
                Architect role, local node credentials, or governance-recognized permissions once those
                authority checks exist.
              </p>
              <p className="text-xs text-zinc-500">
                Until then, this page should remain an internal implementation surface, not a public module.
              </p>
            </div>
          </PanelSection>
        </div>
      </PanelShell>
    </AppStage>
  );
}
