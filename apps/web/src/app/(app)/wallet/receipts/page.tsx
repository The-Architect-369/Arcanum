'use client';

import AppStage from '@/components/ui/AppStage';
import ModuleTabRail from '@/components/ui/ModuleTabRail';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';

const TABS = [
  { href: '/wallet/balances', label: 'Balances' },
  { href: '/wallet/receipts', label: 'Receipts' },
  { href: '/wallet/vault', label: 'Vault' },
] as const;

export default function WalletReceiptsPage() {
  return (
    <AppStage>
      <ModuleTabRail tabs={TABS} />
      <PanelShell title="Wallet — Receipts" flush className="min-h-0 flex-1">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Placeholder receipt surface for future factual wallet and chain events.
          </p>

          <PanelSection title="Current State">
            <div className="space-y-2 text-sm text-zinc-300">
              <p>No receipt feed is connected yet.</p>
              <p>Future entries should remain factual, auditable, and meaning-blind.</p>
            </div>
          </PanelSection>
        </div>
      </PanelShell>
    </AppStage>
  );
}
