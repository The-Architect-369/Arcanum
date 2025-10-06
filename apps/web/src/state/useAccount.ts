'use client';

/**
 * Tiny, dependency-free account store with localStorage persistence.
 * React 18-safe useSyncExternalStore implementation (server snapshot cached).
 */

import { useSyncExternalStore } from 'react';

export type AccountSnapshot = Readonly<{
  trusted: boolean;
  showOnboarding: boolean;
  notifCount: number;
  mana: number;
}>;

const STORAGE_KEY = 'acc_state_v1';

// ---- server snapshot MUST be a stable reference ----
const SERVER_SNAPSHOT: AccountSnapshot = Object.freeze({
  trusted: false,
  showOnboarding: false,
  notifCount: 0,
  mana: 0,
});

const listeners = new Set<() => void>();

function freeze<T extends object>(o: T): Readonly<T> {
  return Object.freeze({ ...(o as any) }) as Readonly<T>;
}

let state: AccountSnapshot = SERVER_SNAPSHOT;

// ---- load persisted state on the client ----
function load() {
  try {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = freeze({
        ...SERVER_SNAPSHOT,
        ...parsed,
      });
    }
  } catch {
    /* noop */
  }
}
function save() {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}
if (typeof window !== 'undefined') load();

function notify() {
  for (const cb of Array.from(listeners)) {
    try { cb(); } catch {}
  }
}

// ---- external store API ----
export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getState(): AccountSnapshot {
  // Return the SAME reference for client reads
  return state;
}
function getServerSnapshot(): AccountSnapshot {
  // Must be referentially stable on server
  return SERVER_SNAPSHOT;
}
function getSnapshot(): AccountSnapshot {
  // Client-side snapshot; also stable between renders until we mutate state
  return state;
}

// ---- selectors ----
export function getShowOnboarding(): boolean { return state.showOnboarding; }
export function isTrusted(): boolean { return state.trusted; }
export function getNotificationCount(): number { return state.notifCount; }
export function getManaBalance(): number { return state.mana; }

// ---- mutators ----
export function setShowOnboarding(v: boolean) {
  state = freeze({ ...state, showOnboarding: !!v });
  save(); notify();
}
export function setTrusted(v: boolean) {
  state = freeze({ ...state, trusted: !!v });
  save(); notify();
}
export function setNotificationCount(n: number) {
  const safe = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
  state = freeze({ ...state, notifCount: safe });
  save(); notify();
}
export function setManaBalance(n: number) {
  const safe = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
  state = freeze({ ...state, mana: safe });
  save(); notify();
}

// ---- onboarding lifecycle (stub) ----
export async function beginOnboarding() {
  setShowOnboarding(true);
}
export async function completeOnboarding() {
  setTrusted(true);
  setShowOnboarding(false);
  if (state.mana < 10) setManaBalance(10);
}
export function cancelOnboarding() {
  setShowOnboarding(false);
}

// ---- React hook for live subscription ----
export function useAccount(): AccountSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
