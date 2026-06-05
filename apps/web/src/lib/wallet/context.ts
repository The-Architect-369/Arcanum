import type { AccountSnapshot } from '@/state/useAccount';

export type WalletSettlementStatus =
  | 'device_only'
  | 'bound'
  | 'syncing'
  | 'sync_error'
  | 'chain_witnessed';

export type WalletBalanceState = {
  denom: string;
  amount: string;
  displayAmount?: string;
  source: 'local_scaffold' | 'bank_fallback' | 'arcnet_mana_module';
  lastSyncedAt?: string;
};

export type WalletContext = {
  version: 'wallet.context.v0.1';
  capturedAt: string;
  identityId?: string | null;
  chainAddress?: string | null;
  settlementStatus: WalletSettlementStatus;
  balances: WalletBalanceState[];
  chainAnchor?: {
    tokenId?: string;
    metadata?: string;
    source: 'arcnet_chaincode_module';
  };
  warnings: string[];
};

export type WalletSpendCategory =
  | 'infrastructure'
  | 'anti_spam'
  | 'event_creation'
  | 'optional_utility'
  | 'developer_module'
  | 'governance_deposit'
  | 'curriculum_or_tool';

export type WalletSpendRouteHint = 'burn' | 'treasury' | 'builder_grants' | 'module_account';

export type WalletSpendIntent = {
  id: string;
  createdAt: string;
  amount: string;
  denom: 'umana' | string;
  purpose: string;
  category: WalletSpendCategory;
  recipient?: string;
  routeHint?: WalletSpendRouteHint;
  requiresConfirmation: true;
};

export type WalletSpendGuardResult =
  | { ok: true; intent: WalletSpendIntent; amount: number }
  | { ok: false; message: string };

const FORBIDDEN_PURPOSE_PATTERNS = [
  /identity\s*purchase/i,
  /buy\s*identity/i,
  /dignity/i,
  /vitae\s*grade/i,
  /grade\s*purchase/i,
  /buy\s*recognition/i,
  /purchase\s*recognition/i,
  /buy\s*authority/i,
  /purchase\s*authority/i,
  /readiness\s*acceleration/i,
  /accelerate\s*readiness/i,
  /recover\s*(a\s*)?streak/i,
  /recover\s*(a\s*)?window/i,
  /pay\s*to\s*win/i,
];

function normalizeSettlementStatus(account: AccountSnapshot): WalletSettlementStatus {
  if (account.settlementStatus === 'syncing') return 'syncing';
  if (account.settlementStatus === 'error') return 'sync_error';
  if (account.chainAddress && account.chainAnchorTokenId) return 'chain_witnessed';
  if (account.chainAddress) return 'bound';
  return 'device_only';
}

function balanceSource(account: AccountSnapshot): WalletBalanceState['source'] {
  if (!account.chainAddress) return 'local_scaffold';
  return account.statusMessage?.includes('bank fallback') ? 'bank_fallback' : 'arcnet_mana_module';
}

export function createWalletContext(
  account: AccountSnapshot,
  options: { denom?: string; capturedAt?: Date } = {}
): WalletContext {
  const denom = options.denom ?? 'umana';
  const settlementStatus = normalizeSettlementStatus(account);
  const warnings: string[] = [];

  if (!account.chainAddress) {
    warnings.push('Wallet is device-only until an ARCnet address is bound.');
  }

  if (settlementStatus === 'sync_error') {
    warnings.push(account.statusMessage || 'Last ARCnet sync failed.');
  }

  if (balanceSource(account) === 'local_scaffold') {
    warnings.push('Displayed MANA is local scaffold state, not settled chain truth.');
  }

  return {
    version: 'wallet.context.v0.1',
    capturedAt: (options.capturedAt ?? new Date()).toISOString(),
    identityId: account.identityId,
    chainAddress: account.chainAddress,
    settlementStatus,
    balances: [
      {
        denom,
        amount: String(account.mana),
        displayAmount: `${account.mana} ${denom}`,
        source: balanceSource(account),
        lastSyncedAt: account.lastSyncedAt ?? undefined,
      },
    ],
    chainAnchor: account.chainAnchorTokenId
      ? {
          tokenId: account.chainAnchorTokenId,
          metadata: account.chainAnchorMetadata ?? undefined,
          source: 'arcnet_chaincode_module',
        }
      : undefined,
    warnings,
  };
}

export function createWalletSpendIntent(input: {
  amount: number;
  denom?: string;
  purpose: string;
  category: WalletSpendCategory;
  recipient?: string;
  routeHint?: WalletSpendRouteHint;
  id?: string;
  createdAt?: Date;
}): WalletSpendGuardResult {
  const amount = Math.max(0, Math.floor(Number.isFinite(input.amount) ? input.amount : 0));
  const purpose = input.purpose.trim();
  const denom = input.denom?.trim() || 'umana';

  if (amount <= 0) {
    return { ok: false, message: 'Spend amount must be greater than zero.' };
  }

  if (!purpose) {
    return { ok: false, message: 'Spend purpose is required.' };
  }

  if (FORBIDDEN_PURPOSE_PATTERNS.some((pattern) => pattern.test(purpose))) {
    return {
      ok: false,
      message: 'This spend purpose violates Arcanum wallet policy: payment cannot buy identity, dignity, recognition, readiness, authority, streak recovery, or window recovery.',
    };
  }

  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    ok: true,
    amount,
    intent: {
      id: input.id ?? `spend:${suffix}`,
      createdAt: (input.createdAt ?? new Date()).toISOString(),
      amount: String(amount),
      denom,
      purpose,
      category: input.category,
      recipient: input.recipient,
      routeHint: input.routeHint,
      requiresConfirmation: true,
    },
  };
}

export function validateSpendIntentAgainstWallet(
  context: WalletContext,
  intent: WalletSpendIntent
): WalletSpendGuardResult {
  const amount = Math.max(0, Math.floor(Number(intent.amount)));
  const manaBalance = context.balances.find((balance) => balance.denom === intent.denom) ?? context.balances[0];
  const available = Math.max(0, Math.floor(Number(manaBalance?.amount ?? 0)));

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: 'Spend amount must be greater than zero.' };
  }

  if (amount > available) {
    return { ok: false, message: 'Insufficient available MANA for this local spend.' };
  }

  if (!intent.requiresConfirmation) {
    return { ok: false, message: 'Spend intent must require explicit confirmation.' };
  }

  return { ok: true, intent, amount };
}
