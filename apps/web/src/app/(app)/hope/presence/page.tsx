'use client';

import AppStage from '@/components/ui/AppStage';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import SwipeRoutes from '@/components/ui/SwipeRoutes';
import TabDots from '@/components/ui/TabDots';
import { ReflectionEditor } from './ReflectionEditor';

const ORDER = ['/hope/presence', '/hope/reflection', '/hope/attunement'] as const;

export default function HopePresencePage() {
  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <TabDots
          tabs={[
            { href: ORDER[0], aria: 'Presence' },
            { href: ORDER[1], aria: 'Reflection' },
            { href: ORDER[2], aria: 'Attunement' },
          ]}
        />

        <PanelShell title="Hope — Presence" flush className="min-h-0 flex-1">
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Hope is here as a subtle presence. You may reflect, remain silent, or continue onward.
            </p>

            <PanelSection title="Orientation">
              <p className="text-sm text-zinc-300">
                Presence is the quiet threshold of Hope. No urgency. No demand. No pressure to perform.
              </p>
            </PanelSection>

            <PanelSection title="Leave a Reflection">
              <ReflectionEditor />
            </PanelSection>

            <PanelSection title="Witness">
              <p className="text-sm italic text-zinc-400">
                Nothing has been left here yet.
              </p>
            </PanelSection>
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
