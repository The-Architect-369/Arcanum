'use client';

import AppStage from '@/components/ui/AppStage';
import PanelShell, { PanelSection } from '@/components/ui/PanelShell';

export default function WalletPage() {
  return (
    <AppStage>
      <PanelShell title="Wallet" flush className="min-h-0 flex-1">
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Wallet is a canonical app surface for custody, balances, receipts, and future vault flows.
            It is an interface layer, not a source of truth.
          </p>

          <PanelSection title="Current State">
            <div className="space-y-2 text-sm text-zinc-300">
              <p>Read-only wallet surface for now.</p>
              <p>Chain truth remains external to this page until the wallet + chain MVP are fully wired.</p>
            </div>
          </PanelSection>

          <PanelSection title="Planned Surface">
            <div className="space-y-2 text-sm text-zinc-300">
              <p>• balances, receipts, and transaction review</p>
              <p>• identity-linked custody surfaces</p>
              <p>• future vault / safe flows for user-owned records and proofs</p>
            </div>
          </PanelSection>

          <PanelSection title="Transition Note">
            <div className="space-y-2 text-sm text-zinc-300">
              <p>
                Messaging and group surfaces remain temporarily available under <code>/text</code> while
                Nexus absorbs those flows more cleanly in a later pass.
              </p>
            </div>
          </PanelSection>
        </div>
      </PanelShell>
    </AppStage>
  );
}
