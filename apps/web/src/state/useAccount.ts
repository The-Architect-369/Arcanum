"use client";

import { useSyncExternalStore } from "react";
import { getBalance } from "@/lib/cosmos/queries";
import {
  addReceipt,
  getPersistentValue,
  removePersistentValue,
  setPersistentValue,
} from "@/lib/mobile/persistence";

export type AccountIdentitySource = "none" | "passkey" | "burner" | "mnemonic";

export type SettlementStatus = "unbound" | "bound" | "syncing" | "error";

export type AccountSnapshot = Readonly<{
  trusted: boolean;
  showOnboarding: boolean;
  notifCount: number;
  mana: number;
  identitySource: AccountIdentitySource;
  identityId: string | null;
  accId: string | null;
  handle: string | null;
  chainAddress: string | null;
  peerId: string | null;
  lastSyncedAt: string | null;
  settlementStatus: SettlementStatus;
  statusMessage: string | null;
}>;

type AccountPatch = Partial<AccountSnapshot>;

const STORAGE_KEY = "acc_state_v2";
const PERSIST_KEY = "account:session";

const SERVER_SNAPSHOT: AccountSnapshot = Object.freeze({
  trusted: false,
  showOnboarding: false,
  notifCount: 0,
  mana: 0,
  identitySource: "none",
  identityId: null,
  accId: null,
  handle: null,
  chainAddress: null,
  peerId: null,
  lastSyncedAt: null,
  settlementStatus: "unbound",
  statusMessage: null,
});

const listeners = new Set<() => void>();
let state: AccountSnapshot = SERVER_SNAPSHOT;
let hydrated = false;

function freeze<T extends object>(value: T): Readonly<T> {
  return Object.freeze({ ...(value as Record<string, unknown>) }) as Readonly<T>;
}

function saveLocalSnapshot(snapshot: AccountSnapshot) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore sync persistence errors
  }
}

async function persistSnapshot(snapshot: AccountSnapshot) {
  try {
    await setPersistentValue(PERSIST_KEY, snapshot);
  } catch {
    // ignore async persistence errors
  }
}

function notify() {
  listeners.forEach((callback) => {
    try {
      callback();
    } catch {
      // ignore listener failures
    }
  });
}

function normalizePatch(patch: AccountPatch): AccountPatch {
  const next = { ...patch };

  if ("identityId" in next) {
    next.accId = next.identityId ?? null;
  }

  if ("mana" in next) {
    const mana = Number(next.mana ?? 0);
    next.mana = Number.isFinite(mana) ? Math.max(0, Math.floor(mana)) : 0;
  }

  if ("notifCount" in next) {
    const notifCount = Number(next.notifCount ?? 0);
    next.notifCount = Number.isFinite(notifCount)
      ? Math.max(0, Math.floor(notifCount))
      : 0;
  }

  return next;
}

function setState(patch: AccountPatch, options?: { persist?: boolean }) {
  state = freeze({
    ...state,
    ...normalizePatch(patch),
  });

  const persist = options?.persist !== false;
  if (persist) {
    saveLocalSnapshot(state);
    void persistSnapshot(state);
  }

  notify();
  return state;
}

function loadFromLocalStorage() {
  try {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<AccountSnapshot>;
    state = freeze({
      ...SERVER_SNAPSHOT,
      ...normalizePatch(parsed),
    });
  } catch {
    state = SERVER_SNAPSHOT;
  }
}

export async function hydrateAccountState() {
  if (hydrated) return state;
  hydrated = true;

  const persisted = await getPersistentValue<Partial<AccountSnapshot>>(PERSIST_KEY);
  if (!persisted) return state;

  state = freeze({
    ...SERVER_SNAPSHOT,
    ...state,
    ...normalizePatch(persisted),
  });
  saveLocalSnapshot(state);
  notify();
  return state;
}

if (typeof window !== "undefined") {
  loadFromLocalStorage();
  void hydrateAccountState();
}

export function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getState(): AccountSnapshot {
  return state;
}

function getServerSnapshot(): AccountSnapshot {
  return SERVER_SNAPSHOT;
}

function getSnapshot(): AccountSnapshot {
  return state;
}

export function getShowOnboarding() {
  return state.showOnboarding;
}

export function isTrusted() {
  return state.trusted;
}

export function getNotificationCount() {
  return state.notifCount;
}

export function getManaBalance() {
  return state.mana;
}

export function setShowOnboarding(value: boolean) {
  setState({ showOnboarding: !!value });
}

export function setTrusted(value: boolean) {
  setState({ trusted: !!value });
}

export function setNotificationCount(value: number) {
  setState({ notifCount: value });
}

export function setManaBalance(value: number) {
  setState({ mana: value });
}

export function spendMana(amount: number) {
  const safeAmount = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
  if (safeAmount <= 0) return true;
  if (state.mana < safeAmount) return false;
  setState({ mana: state.mana - safeAmount });
  return true;
}

export function creditMana(amount: number) {
  const safeAmount = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
  if (safeAmount <= 0) return state.mana;
  setState({ mana: state.mana + safeAmount });
  return state.mana;
}

export function setAccountSession(
  session: Partial<
    Pick<
      AccountSnapshot,
      | "trusted"
      | "identitySource"
      | "identityId"
      | "accId"
      | "handle"
      | "chainAddress"
      | "peerId"
      | "mana"
      | "settlementStatus"
      | "statusMessage"
      | "lastSyncedAt"
    >
  >
) {
  return setState(session);
}

export async function clearAccountSession() {
  state = SERVER_SNAPSHOT;
  saveLocalSnapshot(state);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ARCANUM_NODE_INITIALIZED");
    }
  } catch {
    // ignore
  }
  await removePersistentValue(PERSIST_KEY);
  notify();
}

export async function beginOnboarding() {
  setShowOnboarding(true);
  await addReceipt({
    kind: "identity",
    title: "Identity activation started",
    summary: "Opened activation flow.",
    status: "info",
  });
}

export async function completeOnboarding() {
  setState({
    trusted: true,
    showOnboarding: false,
    statusMessage: "Identity activated on this device.",
  });

  await addReceipt({
    kind: "identity",
    title: "Identity activated",
    summary: "ACC surface activated on this device.",
    status: "confirmed",
  });
}

export function cancelOnboarding() {
  setShowOnboarding(false);
}

export async function syncChainBalance() {
  if (!state.chainAddress) {
    setState({
      settlementStatus: "unbound",
      statusMessage: "No chain address is bound to this mobile session.",
    });
    return {
      ok: false as const,
      message: "No chain address bound.",
    };
  }

  setState({
    settlementStatus: "syncing",
    statusMessage: "Syncing balance from ARCnet...",
  });

  const denom =
    process.env.NEXT_PUBLIC_ARCANUM_BASE_DENOM ||
    process.env.NEXT_PUBLIC_ARC_DENOM ||
    "umana";

  try {
    const balance = await getBalance({
      rpc: process.env.NEXT_PUBLIC_ARCANUM_RPC || "",
      address: state.chainAddress,
      denom,
    });

    const amount = Number(balance.amount ?? 0);
    const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
    const syncedAt = new Date().toISOString();

    setState({
      mana: safeAmount,
      settlementStatus: "bound",
      statusMessage: `Synced ${safeAmount} ${denom}.`,
      lastSyncedAt: syncedAt,
    });

    await addReceipt({
      kind: "wallet_sync",
      title: "Wallet synced",
      summary: `Fetched ${safeAmount} ${denom} from ARCnet.`,
      amount: safeAmount,
      status: "confirmed",
      metadata: {
        address: state.chainAddress,
        denom,
      },
    });

    return {
      ok: true as const,
      amount: safeAmount,
      denom,
      syncedAt,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync balance from ARCnet.";

    setState({
      settlementStatus: "error",
      statusMessage: message,
    });

    await addReceipt({
      kind: "wallet_sync",
      title: "Wallet sync failed",
      summary: message,
      status: "error",
      metadata: {
        address: state.chainAddress,
        denom,
      },
    });

    return {
      ok: false as const,
      message,
    };
  }
}

export function useAccount(): AccountSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
