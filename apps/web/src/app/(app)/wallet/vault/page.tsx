'use client';

import AppStage from '@/components/ui/AppStage';
import ModuleTabRail from '@/components/ui/ModuleTabRail';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';

const TABS = [
  { href: '/wallet/balances', label: 'Balances' },
  { href: '/wallet/receipts', label: 'Receipts' },
  { href: '/wallet/vault', label: 'Vault' },
] as const;

export default function WalletVaultPage() {
  return (
    <AppStage>
      <ModuleTabRail tabs={TABS} />
      <PanelShell title="Wallet — Vault" flush className="min-h-0 flex-1">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Placeholder vault surface for future user-owned proofs, records, and custody flows.
          </p>

          <PanelSection title="Current State">
            <div className="space-y-2 text-sm text-zinc-300">
              <p>No vault storage is connected yet.</p>
              <p>This page reserves the route without implying custody or settlement behavior.</p>
            </div>
          </PanelSection>
        </div>
      </PanelShell>
    </AppStage>
  );
}
