"use client";

import {
  getPersistentValue,
  removePersistentValue,
  setPersistentValue,
} from "@/lib/mobile/persistence";

const STORAGE_KEY = "identity:burner";
const LEGACY_STORAGE_KEY = "arcanum.burner";

export type StoredBurner = {
  id: string;
  createdAt: number;
  kind: "burner";
};

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function randomId() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `burner_${toHex(bytes)}`;
}

export async function hasBurner(): Promise<boolean> {
  const burner = await loadBurner();
  return Boolean(burner);
}

export async function loadBurner(): Promise<string | null> {
  const persisted = await getPersistentValue<StoredBurner>(STORAGE_KEY);
  if (persisted?.id) return persisted.id;

  try {
    if (typeof window === "undefined") return null;
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return null;
    const migrated: StoredBurner = {
      id: legacy,
      createdAt: Date.now(),
      kind: "burner",
    };
    await setPersistentValue(STORAGE_KEY, migrated);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migrated.id;
  } catch {
    return null;
  }
}

export async function getBurnerRecord(): Promise<StoredBurner | null> {
  const persisted = await getPersistentValue<StoredBurner>(STORAGE_KEY);
  if (persisted) return persisted;
  const id = await loadBurner();
  return id
    ? {
        id,
        createdAt: Date.now(),
        kind: "burner",
      }
    : null;
}

export async function createBurner(): Promise<string> {
  const record: StoredBurner = {
    id: randomId(),
    createdAt: Date.now(),
    kind: "burner",
  };
  await setPersistentValue(STORAGE_KEY, record);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
  return record.id;
}

export async function forgetBurner(): Promise<void> {
  await removePersistentValue(STORAGE_KEY);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}
