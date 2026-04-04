// src/lib/infra/ipfs.ts
//
// Temporary browser-safe IPFS facade:
// - avoids bundling helia/libp2p into the Next client build
// - stores JSON + file payloads in localStorage keyed by a local CID-like id
// - best-effort POSTs to /api/ipfs for future server integration

type CachedJsonRecord = {
  kind: 'json';
  value: unknown;
};

type CachedFileRecord = {
  kind: 'file';
  name: string;
  mime: string;
  dataUrl: string;
};

type CachedRecord = CachedJsonRecord | CachedFileRecord;

function isBrowser() {
  return typeof window !== 'undefined';
}

function makeCid(prefix: string) {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '')
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `local-${prefix}-${rand}`;
}

function cacheKey(cid: string) {
  return `ARCANUM_IPFS_CACHE:${cid}`;
}

function setCache(cid: string, record: CachedRecord) {
  if (!isBrowser()) return;
  window.localStorage.setItem(cacheKey(cid), JSON.stringify(record));
}

function getCache(cid: string): CachedRecord | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(cacheKey(cid));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedRecord;
  } catch {
    return null;
  }
}

async function postStub(body: unknown) {
  try {
    await fetch('/api/ipfs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // ignore for local-first dev flow
  }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, data] = dataUrl.split(',', 2);
  const mimeMatch = /data:(.*?);base64/.exec(meta || '');
  const mime = mimeMatch?.[1] || 'application/octet-stream';
  const bin = atob(data || '');
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function getJSONHelia<T = unknown>(cid: string): Promise<T | null> {
  const record = getCache(cid);
  if (!record || record.kind !== 'json') return null;
  return record.value as T;
}

export async function getBlobHelia(cid: string): Promise<Blob> {
  const record = getCache(cid);
  if (!record || record.kind !== 'file') {
    throw new Error(`Blob not found for CID: ${cid}`);
  }
  return dataUrlToBlob(record.dataUrl);
}

export async function putJSONHelia(data: unknown): Promise<{ cid: string }> {
  const cid = makeCid('json');
  setCache(cid, { kind: 'json', value: data });
  await postStub({ cid, kind: 'json', value: data });
  return { cid };
}

export async function putFileHelia(file: File): Promise<{ cid: string }> {
  const cid = makeCid('file');
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });

  setCache(cid, {
    kind: 'file',
    name: file.name,
    mime: file.type || 'application/octet-stream',
    dataUrl,
  });

  await postStub({
    cid,
    kind: 'file',
    name: file.name,
    mime: file.type || 'application/octet-stream',
  });

  return { cid };
}
