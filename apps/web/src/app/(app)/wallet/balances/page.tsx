'use client';

import AppStage from '@/components/ui/AppStage';
import ModuleTabRail from '@/components/ui/ModuleTabRail';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';
import SwipeRoutes from '@/components/ui/SwipeRoutes';

const ORDER = ['/wallet/balances', '/wallet/receipts', '/wallet/vault'] as const;
const TABS = [
  { href: ORDER[0], label: 'Balances' },
  { href: ORDER[1], label: 'Receipts' },
  { href: ORDER[2], label: 'Vault' },
] as const;

export default function WalletBalancesPage() {
  return (
    <SwipeRoutes order={ORDER}>
      <AppStage>
        <PanelShell
          title="Wallet — Balances"
          tabs={<ModuleTabRail tabs={TABS} />}
          flush
          className="min-h-0 flex-1"
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Placeholder balance surface for MANA, custody state, and future account summaries.
            </p>

            <PanelSection title="Current State">
              <div className="space-y-2 text-sm text-zinc-300">
                <p>Read-only placeholder. No balances are fetched or settled here yet.</p>
                <p>This route is a placeholder only; it does not imply active custody or settlement.</p>
              </div>
            </PanelSection>
          </div>
        </PanelShell>
      </AppStage>
    </SwipeRoutes>
  );
}
