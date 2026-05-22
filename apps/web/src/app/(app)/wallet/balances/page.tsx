'use client';

import AppStage from '@/components/ui/AppStage';
import ModuleTabRail from '@/components/ui/ModuleTabRail';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';

const TABS = [
  { href: '/wallet/balances', label: 'Balances' },
  { href: '/wallet/receipts', label: 'Receipts' },
  { href: '/wallet/vault', label: 'Vault' },
] as const;

export default function WalletBalancesPage() {
  return (
    <AppStage>
      <ModuleTabRail tabs={TABS} />
      <PanelShell title="Wallet — Balances" flush className="min-h-0 flex-1">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Placeholder balance surface for MANA, custody state, and future account summaries.
          </p>

          <PanelSection title="Current State">
            <div className="space-y-2 text-sm text-zinc-300">
              <p>Read-only placeholder. No balances are fetched or settled here yet.</p>
              <p>Chain truth remains external until the wallet and ARCnet MVP are wired.</p>
            </div>
          </PanelSection>
        </div>
      </PanelShell>
    </AppStage>
  );
}
