"use client";

export type LocalReceiptStatus = "pending" | "confirmed" | "error" | "info";

export type LocalReceipt = {
  id: string;
  kind: string;
  title: string;
  summary?: string;
  amount?: number;
  status: LocalReceiptStatus;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

type KVRecord<T = unknown> = {
  key: string;
  value: T;
  updatedAt: string;
};

type IPFSJsonRecord = {
  cid: string;
  kind: "json";
  json: unknown;
  text: string;
  size: number;
  createdAt: string;
};

type IPFSFileRecord = {
  cid: string;
  kind: "file";
  blob: Blob;
  name?: string;
  mime?: string;
  size: number;
  createdAt: string;
};

type IPFSFallbackRecord =
  | (Omit<IPFSJsonRecord, "json"> & { json: unknown })
  | (Omit<IPFSFileRecord, "blob"> & { dataUrl: string });

type IPFSRecord = IPFSJsonRecord | IPFSFileRecord;

const DB_NAME = "arcanum-mobile";
const DB_VERSION = 1;
const KV_STORE = "kv";
const IPFS_STORE = "ipfs";
const RECEIPTS_STORE = "receipts";

let dbPromise: Promise<IDBDatabase> | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function hasIndexedDB() {
  return isBrowser() && typeof indexedDB !== "undefined";
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function transactionDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted."));
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed."));
  });
}

function openDatabase() {
  if (!hasIndexedDB()) {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }

  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(KV_STORE)) {
          db.createObjectStore(KV_STORE, { keyPath: "key" });
        }

        if (!db.objectStoreNames.contains(IPFS_STORE)) {
          db.createObjectStore(IPFS_STORE, { keyPath: "cid" });
        }

        if (!db.objectStoreNames.contains(RECEIPTS_STORE)) {
          const store = db.createObjectStore(RECEIPTS_STORE, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
    });
  }

  return dbPromise;
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  runner: (store: IDBObjectStore) => Promise<T>
) {
  const db = await openDatabase();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  const result = await runner(store);
  await transactionDone(tx);
  return result;
}

function fallbackKey(prefix: string, key: string) {
  return `arcanum:${prefix}:${key}`;
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, payload] = dataUrl.split(",", 2);
  const mime = /data:(.*?);base64/.exec(meta || "")?.[1] || "application/octet-stream";
  const binary = atob(payload || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob."));
    reader.readAsDataURL(blob);
  });
}

export async function setPersistentValue<T>(key: string, value: T) {
  const record: KVRecord<T> = {
    key,
    value,
    updatedAt: new Date().toISOString(),
  };

  if (!hasIndexedDB()) {
    if (isBrowser()) {
      window.localStorage.setItem(fallbackKey("kv", key), JSON.stringify(record));
    }
    return;
  }

  await withStore(KV_STORE, "readwrite", async (store) => {
    await requestToPromise(store.put(record));
  });
}

export async function getPersistentValue<T>(key: string): Promise<T | null> {
  if (!hasIndexedDB()) {
    return (
      safeJsonParse<KVRecord<T>>(isBrowser() ? window.localStorage.getItem(fallbackKey("kv", key)) : null)
        ?.value ?? null
    );
  }

  try {
    const record = await withStore(KV_STORE, "readonly", async (store) => {
      return (await requestToPromise(store.get(key))) as KVRecord<T> | undefined;
    });
    return record?.value ?? null;
  } catch {
    return null;
  }
}

export async function removePersistentValue(key: string) {
  if (!hasIndexedDB()) {
    if (isBrowser()) {
      window.localStorage.removeItem(fallbackKey("kv", key));
    }
    return;
  }

  await withStore(KV_STORE, "readwrite", async (store) => {
    await requestToPromise(store.delete(key));
  });
}

export async function putIPFSJsonRecord(cid: string, json: unknown, text: string) {
  const record: IPFSJsonRecord = {
    cid,
    kind: "json",
    json,
    text,
    size: text.length,
    createdAt: new Date().toISOString(),
  };

  if (!hasIndexedDB()) {
    if (isBrowser()) {
      const fallback: IPFSFallbackRecord = record;
      window.localStorage.setItem(fallbackKey("ipfs", cid), JSON.stringify(fallback));
    }
    return;
  }

  await withStore(IPFS_STORE, "readwrite", async (store) => {
    await requestToPromise(store.put(record));
  });
}

export async function putIPFSFileRecord(
  cid: string,
  blob: Blob,
  meta: { name?: string; mime?: string }
) {
  const record: IPFSFileRecord = {
    cid,
    kind: "file",
    blob,
    name: meta.name,
    mime: meta.mime || blob.type || "application/octet-stream",
    size: blob.size,
    createdAt: new Date().toISOString(),
  };

  if (!hasIndexedDB()) {
    if (isBrowser()) {
      const fallback: IPFSFallbackRecord = {
        cid,
        kind: "file",
        dataUrl: await blobToDataUrl(blob),
        name: record.name,
        mime: record.mime,
        size: record.size,
        createdAt: record.createdAt,
      };
      window.localStorage.setItem(fallbackKey("ipfs", cid), JSON.stringify(fallback));
    }
    return;
  }

  await withStore(IPFS_STORE, "readwrite", async (store) => {
    await requestToPromise(store.put(record));
  });
}

export async function getIPFSJsonRecord<T = unknown>(cid: string): Promise<T | null> {
  if (!hasIndexedDB()) {
    const fallback = safeJsonParse<IPFSFallbackRecord>(
      isBrowser() ? window.localStorage.getItem(fallbackKey("ipfs", cid)) : null
    );
    return fallback && fallback.kind === "json" ? (fallback.json as T) : null;
  }

  try {
    const record = await withStore(IPFS_STORE, "readonly", async (store) => {
      return (await requestToPromise(store.get(cid))) as IPFSRecord | undefined;
    });
    return record?.kind === "json" ? (record.json as T) : null;
  } catch {
    return null;
  }
}

export async function getIPFSFileRecord(
  cid: string
): Promise<{ blob: Blob; name?: string; mime?: string; size: number; createdAt: string } | null> {
  if (!hasIndexedDB()) {
    const fallback = safeJsonParse<IPFSFallbackRecord>(
      isBrowser() ? window.localStorage.getItem(fallbackKey("ipfs", cid)) : null
    );
    if (!fallback || fallback.kind !== "file") return null;
    return {
      blob: dataUrlToBlob(fallback.dataUrl),
      name: fallback.name,
      mime: fallback.mime,
      size: fallback.size,
      createdAt: fallback.createdAt,
    };
  }

  try {
    const record = await withStore(IPFS_STORE, "readonly", async (store) => {
      return (await requestToPromise(store.get(cid))) as IPFSRecord | undefined;
    });
    if (!record || record.kind !== "file") return null;
    return {
      blob: record.blob,
      name: record.name,
      mime: record.mime,
      size: record.size,
      createdAt: record.createdAt,
    };
  } catch {
    return null;
  }
}

export async function listIPFSRecords(limit = 50): Promise<
  Array<{
    cid: string;
    kind: "json" | "file";
    name?: string;
    mime?: string;
    size: number;
    createdAt: string;
  }>
> {
  if (!isBrowser()) return [];

  if (!hasIndexedDB()) {
    const out: Array<{
      cid: string;
      kind: "json" | "file";
      name?: string;
      mime?: string;
      size: number;
      createdAt: string;
    }> = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key || !key.startsWith("arcanum:ipfs:")) continue;
      const record = safeJsonParse<IPFSFallbackRecord>(window.localStorage.getItem(key));
      if (!record) continue;
      out.push({
        cid: record.cid,
        kind: record.kind,
        name: "name" in record ? record.name : undefined,
        mime: "mime" in record ? record.mime : undefined,
        size: record.size,
        createdAt: record.createdAt,
      });
    }
    return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }

  try {
    const db = await openDatabase();
    const tx = db.transaction(IPFS_STORE, "readonly");
    const store = tx.objectStore(IPFS_STORE);
    const all = (await requestToPromise(store.getAll())) as IPFSRecord[];
    await transactionDone(tx);
    return all
      .map((record) => ({
        cid: record.cid,
        kind: record.kind,
        name: record.kind === "file" ? record.name : undefined,
        mime: record.kind === "file" ? record.mime : undefined,
        size: record.size,
        createdAt: record.createdAt,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function clearIPFSRecords() {
  if (!isBrowser()) return;

  if (!hasIndexedDB()) {
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith("arcanum:ipfs:")) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
    return;
  }

  await withStore(IPFS_STORE, "readwrite", async (store) => {
    await requestToPromise(store.clear());
  });
}

function makeReceiptId() {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `receipt:${suffix}`;
}

export async function addReceipt(
  input: Omit<LocalReceipt, "id" | "createdAt"> & { createdAt?: string }
): Promise<LocalReceipt> {
  const record: LocalReceipt = {
    id: makeReceiptId(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    ...input,
  };

  if (!hasIndexedDB()) {
    if (isBrowser()) {
      const current =
        safeJsonParse<LocalReceipt[]>(window.localStorage.getItem(fallbackKey("kv", "receipts"))) ?? [];
      current.unshift(record);
      window.localStorage.setItem(fallbackKey("kv", "receipts"), JSON.stringify(current.slice(0, 200)));
    }
    return record;
  }

  await withStore(RECEIPTS_STORE, "readwrite", async (store) => {
    await requestToPromise(store.put(record));
  });
  return record;
}

export async function listReceipts(limit = 50): Promise<LocalReceipt[]> {
  if (!isBrowser()) return [];

  if (!hasIndexedDB()) {
    const current =
      safeJsonParse<LocalReceipt[]>(window.localStorage.getItem(fallbackKey("kv", "receipts"))) ?? [];
    return current
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  try {
    const db = await openDatabase();
    const tx = db.transaction(RECEIPTS_STORE, "readonly");
    const store = tx.objectStore(RECEIPTS_STORE);
    const all = (await requestToPromise(store.getAll())) as LocalReceipt[];
    await transactionDone(tx);
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  } catch {
    return [];
  }
}

export async function clearReceipts() {
  if (!isBrowser()) return;

  if (!hasIndexedDB()) {
    window.localStorage.removeItem(fallbackKey("kv", "receipts"));
    return;
  }

  await withStore(RECEIPTS_STORE, "readwrite", async (store) => {
    await requestToPromise(store.clear());
  });
}
