'use client';

import ModuleTabRail from '@/components/ui/ModuleTabRail';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import AppStage from '@/components/ui/AppStage';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import { VITAE_SCHOOLS, VITAE_SPECIALIZATIONS } from '@/lib/mobile/vitae-map';

const ORDER = ['/vitae/grade', '/vitae/path', '/vitae/mastery'] as const;
const TABS = [
  { href: ORDER[0], label: 'Map' },
  { href: ORDER[1], label: 'Path' },
  { href: ORDER[2], label: 'Record' },
] as const;

export default function VitaeGradePage() {
  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell tabs={<ModuleTabRail tabs={TABS} />} title="Vitae — Map" flush className="flex-1">
          <div className="space-y-5">
            <p className="text-sm text-zinc-300">
              Vitae is a living curriculum map: ten grades across three schools, followed by non-hierarchical
              specialization paths. This map is orientation, not rank, score, or pressure.
            </p>

            {VITAE_SCHOOLS.map((school) => (
              <PanelSection key={school.id} title={school.title}>
                <div className="space-y-3">
                  <p className="text-sm text-zinc-300">{school.purpose}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {school.grades.map((grade) => (
                      <article key={grade.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Grade {grade.number}</div>
                        <h2 className="mt-1 text-sm font-medium text-zinc-100">{grade.title}</h2>
                        <p className="mt-2 text-sm text-amber-200/90">{grade.function}</p>
                        <p className="mt-2 text-sm text-zinc-300">{grade.summary}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </PanelSection>
            ))}

            <PanelSection title="Specializations">
              <div className="space-y-3">
                <p className="text-sm text-zinc-300">
                  Specializations are post-Adept stewardship paths. They are adjacent, not vertical.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {VITAE_SPECIALIZATIONS.map((item) => (
                    <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <h2 className="text-sm font-medium text-zinc-100">{item.title}</h2>
                      <p className="mt-2 text-sm text-amber-200/90">{item.mandate}</p>
                      <p className="mt-2 text-sm text-zinc-300">Domain: {item.domain}</p>
                      <p className="mt-2 text-xs text-zinc-500">Risk: {item.risk}</p>
                      <p className="mt-1 text-xs text-zinc-500">Safeguard: {item.safeguard}</p>
                    </article>
                  ))}
                </div>
              </div>
            </PanelSection>
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
