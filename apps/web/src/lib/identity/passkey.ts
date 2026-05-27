"use client";

import {
  getPersistentValue,
  removePersistentValue,
  setPersistentValue,
} from "@/lib/mobile/persistence";

const STORAGE_KEY = "identity:passkey";
const LEGACY_STORAGE_KEY = "arcanum:passkey";

export type StoredPasskey = {
  id: string;
  createdAt: number;
  lastSignIn?: number;
  label: string;
  kind: "passkey";
};

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let text = "";
  bytes.forEach((value) => {
    text += String.fromCharCode(value);
  });
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const text = atob(padded);
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) {
    bytes[index] = text.charCodeAt(index);
  }
  return bytes;
}

function randomChallenge() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes;
}

export async function getPasskey(): Promise<StoredPasskey | null> {
  const persisted = await getPersistentValue<StoredPasskey>(STORAGE_KEY);
  if (persisted) return persisted;

  try {
    if (typeof window === "undefined") return null;
    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) return null;
    const legacy = JSON.parse(legacyRaw) as Partial<StoredPasskey>;
    if (!legacy?.createdAt) return null;
    const migrated: StoredPasskey = {
      id: legacy.id || `legacy-${legacy.createdAt}`,
      createdAt: legacy.createdAt,
      lastSignIn: legacy.lastSignIn,
      label: legacy.label || "Arcanum Passkey",
      kind: "passkey",
    };
    await setPersistentValue(STORAGE_KEY, migrated);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migrated;
  } catch {
    return null;
  }
}

export async function clearPasskey() {
  await removePersistentValue(STORAGE_KEY);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export async function registerPasskey() {
  if (typeof window === "undefined") {
    throw new Error("Passkey registration is only available in the browser.");
  }

  if (!(window.PublicKeyCredential && navigator.credentials?.create)) {
    throw new Error("Passkeys are not supported in this browser.");
  }

  const userId = crypto.getRandomValues(new Uint8Array(16));

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: { name: "Arcanum" },
      user: {
        id: userId,
        name: "guest@arcanum.local",
        displayName: "Arcanum Guest",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Passkey registration was cancelled.");
  }

  const record: StoredPasskey = {
    id: toBase64Url(credential.rawId),
    createdAt: Date.now(),
    label: "Arcanum Passkey",
    kind: "passkey",
  };

  await setPersistentValue(STORAGE_KEY, record);
  return record;
}

export async function signInPasskey() {
  if (typeof window === "undefined") {
    throw new Error("Passkey sign-in is only available in the browser.");
  }

  const existing = await getPasskey();
  if (!existing) {
    throw new Error("No passkey is registered on this device.");
  }

  if (!(window.PublicKeyCredential && navigator.credentials?.get)) {
    throw new Error("Passkeys are not supported in this browser.");
  }

  await navigator.credentials.get({
    publicKey: {
      challenge: randomChallenge(),
      userVerification: "preferred",
      timeout: 60_000,
      allowCredentials: [
        {
          id: fromBase64Url(existing.id),
          type: "public-key",
        },
      ],
    },
  });

  const updated: StoredPasskey = {
    ...existing,
    lastSignIn: Date.now(),
  };

  await setPersistentValue(STORAGE_KEY, updated);
  return updated;
}
