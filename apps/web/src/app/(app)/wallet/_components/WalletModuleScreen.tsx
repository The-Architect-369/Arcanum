"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import AppStage from "@/components/ui/AppStage";
import ModuleMatrixShell from "@/components/ui/ModuleMatrixShell";
import { LockHint } from "@/components/shared/LockHint";
import CTAActivate from "@/components/shared/CTAActivate";
import { cn } from "@/lib/cn";
import { listReceipts, listIPFSRecords, type LocalReceipt } from "@/lib/mobile/persistence";
import { getRitesState, summarizeRites } from "@/lib/mobile/rites";
import { createWalletContext } from "@/lib/wallet/context";
import { getBurnerRecord } from "@/lib/identity/burner";
import { getPasskey, type StoredPasskey } from "@/lib/identity/passkey";
import { bindChainAddress, syncChainBalance, useAccount } from "@/state/useAccount";

export type WalletFamilyId = "balances" | "receipts" | "vault";
type CardId = string;
type FamilyMotion = "idle" | "next" | "prev";

type CardConfig = {
  id: CardId;
  title: string;
  caption: string;
  navLabel: string;
  render: () => React.ReactNode;
};

type FamilyConfig = {
  href: string;
  label: string;
  shellAction: React.ReactNode;
  cards: CardConfig[];
};

type VaultSummary = {
  passkey: StoredPasskey | null;
  burnerId: string | null;
  cachedContentCount: number;
};

const ORDER = ["/wallet/balances", "/wallet/receipts", "/wallet/vault"] as const;
const FAMILY_BY_HREF: Record<(typeof ORDER)[number], WalletFamilyId> = {
  "/wallet/balances": "balances",
  "/wallet/receipts": "receipts",
  "/wallet/vault": "vault",
};
const FAMILY_INDEX: Record<WalletFamilyId, number> = {
  balances: 0,
  receipts: 1,
  vault: 2,
};
const baseDenom = process.env.NEXT_PUBLIC_ARCANUM_BASE_DENOM || process.env.NEXT_PUBLIC_ARC_DENOM || "umana";
const EMPTY_VAULT: VaultSummary = { passkey: null, burnerId: null, cachedContentCount: 0 };

function familyFromPathname(pathname: string): WalletFamilyId | null {
  const clean = pathname.split("?")[0]?.split("#")[0] || "";
  if (clean in FAMILY_BY_HREF) return FAMILY_BY_HREF[clean as keyof typeof FAMILY_BY_HREF];
  return null;
}

function motionForFamilyChange(from: WalletFamilyId, to: WalletFamilyId): FamilyMotion {
  if (from === to) return "idle";
  return FAMILY_INDEX[to] > FAMILY_INDEX[from] ? "next" : "prev";
}

function subtitleFromCardTitle(title: string) {
  return title.replace(/^Wallet\s*-\s*/i, "");
}

export function WalletModuleScreen({ family }: { family: WalletFamilyId }) {
  const account = useAccount();
  const walletContext = useMemo(() => createWalletContext(account, { denom: baseDenom }), [account]);
  const [activeFamilyId, setActiveFamilyId] = useState<WalletFamilyId>(family);
  const [activeCardId, setActiveCardId] = useState<CardId>("a1");
  const [familyMotion, setFamilyMotion] = useState<FamilyMotion>("idle");
  const [familyMotionKey, setFamilyMotionKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<LocalReceipt[]>([]);
  const [ritesState, setRitesState] = useState<Awaited<ReturnType<typeof getRitesState>> | null>(null);
  const [receiptsLoading, setReceiptsLoading] = useState(true);
  const [vaultSummary, setVaultSummary] = useState<VaultSummary>(EMPTY_VAULT);
  const [bindAddress, setBindAddress] = useState("");

  const ritesSummary = useMemo(() => summarizeRites(ritesState ?? { credits: [], updatedAt: null }), [ritesState]);

  async function loadReceipts() {
    const [nextReceipts, nextRites] = await Promise.all([listReceipts(100), getRitesState()]);
    setRows(nextReceipts);
    setRitesState(nextRites);
    setReceiptsLoading(false);
  }

  async function loadVault() {
    const [passkey, burner, ipfsEntries] = await Promise.all([getPasskey(), getBurnerRecord(), listIPFSRecords(500)]);
    setVaultSummary({ passkey, burnerId: burner?.id ?? null, cachedContentCount: ipfsEntries.length });
  }

  useEffect(() => {
    void loadReceipts();
    void loadVault();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setFamilyMotion("idle"), 190);
    return () => window.clearTimeout(timer);
  }, [familyMotionKey]);

  async function handleSync() {
    setBusy(true);
    setMessage(null);
    const result = await syncChainBalance();
    setMessage(result.ok ? `Synced ${result.amount} ${result.denom} from ${result.source}.${result.supply ? ` Supply ${result.supply}.` : ""}` : result.message);
    setBusy(false);
    await loadReceipts();
  }

  async function handleBind() {
    if (!bindAddress.trim()) {
      setMessage("Enter an ARCnet address first.");
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await bindChainAddress(bindAddress, { sync: true });
    setMessage(result.message ?? (result.ok ? "Address bound." : "Failed to bind address."));
    setBusy(false);
    await loadReceipts();
  }

  const families = useMemo<Record<WalletFamilyId, FamilyConfig>>(() => ({
    balances: {
      href: ORDER[0],
      label: "Balances",
      shellAction: <div className="text-xs text-zinc-400">A track · means, settlement, and exchange posture</div>,
      cards: [
        { id: "a1", navLabel: "A1", title: "Wallet - A1 Means", caption: "The immediate money view. This is where the user returns to see present MANA, settlement visibility, and whether the wallet is still local or already chain-bound.", render: () => <BalanceOverviewCard account={account} /> },
        { id: "a2", navLabel: "A2", title: "Wallet - A2 Settlement", caption: "The trust layer. Settlement distinguishes local scaffold state from bound and chain-witnessed value so the user knows what is merely device-held and what has been externally confirmed.", render: () => <SettlementCard account={account} walletContext={walletContext} bindAddress={bindAddress} setBindAddress={setBindAddress} onBind={handleBind} onSync={handleSync} busy={busy} message={message} /> },
        { id: "a3", navLabel: "A3", title: "Wallet - A3 Exchange Posture", caption: "The future bridge to buying, selling, sending, and withdrawing value. For now it keeps economic guardrails visible so the wallet grows without selling dignity, identity, readiness, or authority.", render: () => <SpendPolicyCard walletContext={walletContext} /> },
      ],
    },
    receipts: {
      href: ORDER[1],
      label: "Receipts",
      shellAction: <div className="text-xs text-zinc-400">B track · transactions, RITES, and event memory</div>,
      cards: [
        { id: "b1", navLabel: "B1", title: "Wallet - B1 Transactions", caption: "The factual transaction layer. Activation, sync, spend, and other wallet events live here as concrete memory rather than reputation or score.", render: () => <ReceiptsCard rows={rows} loading={receiptsLoading} /> },
        { id: "b2", navLabel: "B2", title: "Wallet - B2 RITES", caption: "RITES belong in memory, not in spendable balance. This layer keeps participation credit visible without allowing it to masquerade as money, rank, or authority.", render: () => <RitesCard ritesSummary={ritesSummary} /> },
        { id: "b3", navLabel: "B3", title: "Wallet - B3 Ledger", caption: "The broader memory map. Over time this ledger should let the user understand how value, activity, and wallet state have changed across the life of the device and account.", render: () => <LedgerCard rows={rows} loading={receiptsLoading} /> },
      ],
    },
    vault: {
      href: ORDER[2],
      label: "Vault",
      shellAction: <div className="text-xs text-zinc-400">C track · identity, artifacts, and custody</div>,
      cards: [
        { id: "c1", navLabel: "C1", title: "Wallet - C1 Identity", caption: "The core custody layer. Identity artifacts, passkeys, burner material, and chain binding live here as the fixed skeleton of access to the wider Arcanum.", render: () => <IdentityCard account={account} summary={vaultSummary} /> },
        { id: "c2", navLabel: "C2", title: "Wallet - C2 Artifacts", caption: "The held-object layer. Cached content, future soul-bound artifacts, completion markers, and collectible wallet-held objects belong here instead of the spendable balance surface.", render: () => <CacheCard summary={vaultSummary} /> },
        { id: "c3", navLabel: "C3", title: "Wallet - C3 Custody", caption: "The recovery and possession layer. This is where the wallet explains what this device truly holds, what can be rebound, and what still depends on local storage rather than wider witness.", render: () => <CustodyCard account={account} /> },
      ],
    },
  }), [account, bindAddress, busy, message, receiptsLoading, ritesSummary, rows, vaultSummary, walletContext]);

  const activeFamily = families[activeFamilyId];
  const activeCard = activeFamily.cards.find((card) => card.id === activeCardId) ?? activeFamily.cards[0];
  const verticalTabs = activeFamily.cards.map((card) => ({ id: card.id, label: card.navLabel }));
  const titleSubtitle = subtitleFromCardTitle(activeCard.title);

  const transitionToFamily = (nextFamily: WalletFamilyId, syncHistory: boolean) => {
    if (nextFamily === activeFamilyId) return;
    const motion = motionForFamilyChange(activeFamilyId, nextFamily);
    if (syncHistory) window.history.replaceState(window.history.state, "", families[nextFamily].href);
    setFamilyMotion(motion);
    setFamilyMotionKey((value) => value + 1);
    setActiveFamilyId(nextFamily);
  };

  useEffect(() => { transitionToFamily(family, false); }, [family]);
  useEffect(() => { setActiveCardId(activeFamily.cards[0]?.id ?? "a1"); }, [activeFamilyId]);
  useEffect(() => {
    const onPopState = () => {
      const nextFamily = familyFromPathname(window.location.pathname);
      if (nextFamily) transitionToFamily(nextFamily, false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [activeFamilyId, families]);

  const onHorizontalChange = (href: string) => {
    const nextFamily = familyFromPathname(href);
    if (nextFamily) transitionToFamily(nextFamily, true);
  };

  const swipeStart = React.useRef<{ x: number; y: number } | null>(null);
  const swipeLock = React.useRef<"h" | "v" | null>(null);
  const onTouchStartCapture = (e: React.TouchEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('[data-no-route-swipe="true"]')) return;
    const t = e.touches[0]; swipeStart.current = { x: t.clientX, y: t.clientY }; swipeLock.current = null;
  };
  const onTouchMoveCapture = (e: React.TouchEvent) => {
    if (!swipeStart.current) return;
    const t = e.touches[0]; const dx = t.clientX - swipeStart.current.x; const dy = t.clientY - swipeStart.current.y; const ax = Math.abs(dx); const ay = Math.abs(dy);
    if (!swipeLock.current) { if (ax >= 12 && ax > ay * 1.06) swipeLock.current = "h"; else if (ay >= 12 && ay > ax) swipeLock.current = "v"; else return; }
    if (swipeLock.current === "h") e.preventDefault();
  };
  const onTouchEndCapture = (e: React.TouchEvent) => {
    if (!swipeStart.current) return;
    const t = e.changedTouches[0]; const dx = t.clientX - swipeStart.current.x; const dy = t.clientY - swipeStart.current.y; swipeStart.current = null;
    const ax = Math.abs(dx); const ay = Math.abs(dy); if (ax < 12 || ax <= ay * 1.06) return;
    const currentIndex = ORDER.indexOf(activeFamily.href as (typeof ORDER)[number]); if (currentIndex === -1) return;
    const nextIndex = dx < 0 ? currentIndex + 1 : currentIndex - 1; if (nextIndex < 0 || nextIndex >= ORDER.length) return;
    transitionToFamily(FAMILY_BY_HREF[ORDER[nextIndex]], true);
  };

  return (
    <AppStage>
      <div className="h-full min-h-0" onTouchStartCapture={onTouchStartCapture} onTouchMoveCapture={onTouchMoveCapture} onTouchEndCapture={onTouchEndCapture}>
        <ModuleMatrixShell
          title={<div key={`title-${activeFamilyId}-${familyMotionKey}`} className={cn("tempus-title-shell flex min-w-0 items-baseline gap-3 sm:gap-4", familyMotion === "next" && "tempus-title-shell--next", familyMotion === "prev" && "tempus-title-shell--prev")}><span className="tempus-title-word truncate">Wallet</span><span className="tempus-title-subtitle truncate">{titleSubtitle}</span></div>}
          actions={activeFamily.shellAction}
          horizontalTabs={Object.values(families).map(({ href, label }) => ({ href, label }))}
          activeHorizontalHref={activeFamily.href}
          onHorizontalChange={onHorizontalChange}
          verticalTabs={verticalTabs}
          activeVerticalId={activeCard.id}
          onVerticalChange={(id) => setActiveCardId(id)}
          className="min-h-0 flex-1"
        >
          <div key={`${activeFamilyId}-${familyMotionKey}`} className={cn("tempus-family-panel space-y-4", familyMotion === "next" && "tempus-family-panel--next", familyMotion === "prev" && "tempus-family-panel--prev")}>
            <p className="text-sm text-zinc-300">{activeCard.caption}</p>
            {activeCard.render()}
          </div>
        </ModuleMatrixShell>
      </div>
    </AppStage>
  );
}

function BalanceOverviewCard({ account }: { account: ReturnType<typeof useAccount> }) {
  return <div className="grid gap-3 md:grid-cols-4"><MetricCard label="MANA" value={`${account.mana} ${baseDenom}`} /><MetricCard label="Tracked supply" value={account.manaSupply ?? "Unknown"} /><MetricCard label="Settlement" value={account.chainAddress ? "Bound to chain address" : "Device-only"} /><MetricCard label="Last sync" value={account.lastSyncedAt ?? "Never"} /></div>;
}

function SettlementCard({ account, walletContext, bindAddress, setBindAddress, onBind, onSync, busy, message }: { account: ReturnType<typeof useAccount>; walletContext: ReturnType<typeof createWalletContext>; bindAddress: string; setBindAddress: (value: string) => void; onBind: () => void; onSync: () => void; busy: boolean; message: string | null; }) {
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,.95fr)]"><div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Settlement context</div><h3 className="mt-2 text-base font-semibold text-zinc-100">What is actually witnessed</h3><div className="mt-4 grid gap-3 sm:grid-cols-3"><MetricCard label="Context" value={walletContext.version} /><MetricCard label="Status" value={walletContext.settlementStatus} /><MetricCard label="Source" value={walletContext.balances[0]?.source ?? "unknown"} /></div><p className="mt-4 text-xs text-zinc-400">Wallet context distinguishes local scaffold state from chain-witnessed state. It does not grant authority, recognition, readiness, or treasury power.</p>{walletContext.warnings.length > 0 ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100"><div className="font-medium">Warnings</div><ul className="mt-2 list-disc space-y-1 pl-4">{walletContext.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : null}</div><div className="rounded-3xl border border-white/10 bg-black/20 p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Chain binding</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Address and witness</h3><p className="mt-4 break-all font-mono text-xs text-zinc-400">{account.chainAddress ?? "No chain address bound yet."}</p><p className="mt-3 text-sm text-zinc-300">{account.chainAnchorTokenId ? `ARCnet chaincode witness: ${account.chainAnchorTokenId}` : "No ARCnet chaincode witness found for this address yet."}</p><div className="mt-4 space-y-3"><input value={bindAddress} onChange={(e) => setBindAddress(e.target.value)} placeholder="Bind ARCnet address" className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none" /><div className="flex flex-wrap gap-3"><button onClick={onBind} disabled={busy} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-zinc-100 hover:bg-white/10 disabled:opacity-50">{busy ? "Working…" : "Bind + sync"}</button><button onClick={onSync} disabled={busy || !account.chainAddress} className="rounded-xl border border-amber-300/40 px-4 py-2 text-sm text-amber-300 hover:bg-amber-300/10 disabled:opacity-50">{busy ? "Syncing…" : "Sync from ARCnet"}</button></div>{message ? <p className="text-sm text-zinc-300">{message}</p> : null}</div></div></div>;
}

function SpendPolicyCard({ walletContext }: { walletContext: ReturnType<typeof createWalletContext> }) {
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Exchange posture</div><h3 className="mt-2 text-base font-semibold text-zinc-100">What money can and cannot do here</h3><div className="mt-4 space-y-3 text-sm text-zinc-300"><PolicyLine text="Identity, dignity, recognition, readiness, and authority are never purchasable." /><PolicyLine text="Spend intents require confirmation and must fit available MANA." /><PolicyLine text="Future exchange must remain constitutionally bound to utility, not coercion." /></div></div><div className="rounded-3xl border border-white/10 bg-black/20 p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Current route</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Economic posture</h3><div className="mt-4 space-y-3"><PermissionRow label="Settlement" value={walletContext.settlementStatus} /><PermissionRow label="Balance source" value={walletContext.balances[0]?.source ?? "unknown"} /><PermissionRow label="Confirmation" value="Required" /><PermissionRow label="Exchange surface" value="Not live yet" /></div></div></div>;
}

function ReceiptsCard({ rows, loading }: { rows: LocalReceipt[]; loading: boolean }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Transactions</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Local factual memory</h3><div className="mt-4 space-y-3">{loading ? <div className="text-sm text-zinc-400">Loading transactions…</div> : rows.length === 0 ? <div className="text-sm text-zinc-400">No wallet events recorded yet.</div> : rows.slice(0,8).map((row) => <ReceiptRow key={row.id} row={row} />)}</div></div>;
}

function RitesCard({ ritesSummary }: { ritesSummary: ReturnType<typeof summarizeRites> }) {
  return <div className="space-y-4"><div className="grid gap-3 md:grid-cols-4"><MetricCard label="Active credits" value={String(ritesSummary.activeCount)} /><MetricCard label="Amount" value={String(ritesSummary.activeAmount)} /><MetricCard label="Voided" value={String(ritesSummary.voidedCount)} /><MetricCard label="Conversion" value={ritesSummary.conversionStatus} /></div><div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">RITES are local non-transferable participation memory. They are not MANA, not a spendable wallet balance, not authority, and not convertible without future governed policy.</div></div>;
}

function LedgerCard({ rows, loading }: { rows: LocalReceipt[]; loading: boolean }) {
  const grouped = rows.reduce<Record<string, number>>((acc, row) => { acc[row.kind] = (acc[row.kind] ?? 0) + 1; return acc; }, {});
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]"><div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Ledger grouping</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Event kinds</h3><div className="mt-4 space-y-3">{loading ? <div className="text-sm text-zinc-400">Loading ledger…</div> : Object.keys(grouped).length === 0 ? <div className="text-sm text-zinc-400">No ledger entries yet.</div> : Object.entries(grouped).map(([kind, count]) => <PermissionRow key={kind} label={kind} value={String(count)} />)}</div></div><div className="rounded-3xl border border-white/10 bg-black/20 p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Ledger note</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Factual, not reputational</h3><div className="mt-4 text-sm text-zinc-300">The wallet ledger records what happened on this device and account. It should never convert history into worth, purity, or social status.</div></div></div>;
}

function IdentityCard({ account, summary }: { account: ReturnType<typeof useAccount>; summary: VaultSummary }) {
  return <div className="grid gap-3 md:grid-cols-2"><VaultCard label="Account identity" value={account.identityId ?? "Not activated"} mono /><VaultCard label="Stored passkey" value={summary.passkey ? summary.passkey.id : "None"} mono /><VaultCard label="Stored burner" value={summary.burnerId ?? "None"} mono /><VaultCard label="Chain address" value={account.chainAddress ?? "None"} mono /></div>;
}

function CacheCard({ summary }: { summary: VaultSummary }) {
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,.95fr)]"><div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Held artifacts</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Local content and future objects</h3><div className="mt-4"><MetricCard label="Cached content objects" value={String(summary.cachedContentCount)} /></div></div><div className="rounded-3xl border border-white/10 bg-black/20 p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Meaning</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Artifacts, not treasury</h3><div className="mt-4 text-sm text-zinc-300">This layer is where wallet-held objects belong: local IPFS-backed memory now, and later soul-bound artifacts, completion markers, and collectible records.</div></div></div>;
}

function CustodyCard({ account }: { account: ReturnType<typeof useAccount> }) {
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Custody</div><h3 className="mt-2 text-base font-semibold text-zinc-100">What this device truly holds</h3><div className="mt-4 space-y-3"><PermissionRow label="Identity session" value={account.identityId ? "Present" : "Not activated"} /><PermissionRow label="Chain binding" value={account.chainAddress ? "Bound" : "Unbound"} /><PermissionRow label="Settlement truth" value={account.chainAddress ? "Potentially chain-witnessed" : "Local scaffold only"} /></div></div><div className="rounded-3xl border border-white/10 bg-black/20 p-4"><div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Recovery note</div><h3 className="mt-2 text-base font-semibold text-zinc-100">Local before global</h3><div className="mt-4 text-sm text-zinc-300">The wallet still reflects a mobile-first custody model. Some artifacts are only device-held until explicitly rebound, resynced, or witnessed on ARCnet.</div><div className="mt-4"><LockHint label={account.trusted ? "ACC active" : "ACC to strengthen custody"} />{!account.trusted ? <div className="mt-3"><CTAActivate /></div> : null}</div></div></div>;
}

function MetricCard({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</div><div className="mt-1 text-sm text-zinc-100">{value}</div></div>; }
function PolicyLine({ text }: { text: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300">{text}</div>; }
function PermissionRow({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><div className="text-sm text-zinc-300">{label}</div><div className="text-right text-sm text-zinc-100">{value}</div></div>; }
function ReceiptRow({ row }: { row: LocalReceipt }) { return <article className="rounded-2xl border border-white/10 bg-black/30 p-4"><div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400"><span>{row.kind}</span><span>•</span><span>{new Date(row.createdAt).toLocaleString()}</span><span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase">{row.status}</span></div><div className="mt-2 text-sm font-medium text-zinc-100">{row.title}</div>{row.summary ? <div className="mt-1 text-sm text-zinc-300">{row.summary}</div> : null}{typeof row.amount === "number" ? <div className="mt-2 text-xs text-amber-300">Amount: {row.amount}</div> : null}</article>; }
function VaultCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div><div className={mono ? "mt-1 break-all font-mono text-sm text-zinc-100" : "mt-1 text-sm text-zinc-100"}>{value}</div></div>; }
