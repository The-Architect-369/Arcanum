'use client';

import { getStringApi, getFsApi } from './helia';

/** Store JSON via Helia (no gateway). Returns CID (string). */
export async function putJSONHelia(doc: unknown): Promise<string> {
  const s = await getStringApi();
  const cid = await s.add(JSON.stringify(doc));
  return cid.toString();
}

/** Read JSON via Helia by CID. */
export async function getJSONHelia<T = any>(cid: string): Promise<T | null> {
  try {
    const s = await getStringApi();
    const data = await s.get(cid);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/** Store a File via Helia UnixFS and return its CID + metadata. */
export async function putFileHelia(file: File): Promise<{ cid: string; name: string; mime: string; size: number }> {
  const fs = await getFsApi();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const cid = await fs.addBytes(bytes);
  return { cid: cid.toString(), name: file.name, mime: file.type || 'application/octet-stream', size: file.size };
}

/** Fetch a Blob via Helia (for preview). Large files will buffer in memory (MVP). */
export async function getBlobHelia(cid: string, mime = 'application/octet-stream'): Promise<Blob | null> {
  try {
    const fs = await getFsApi();
    const chunks: Uint8Array[] = [];
    for await (const c of fs.cat(cid)) chunks.push(c);
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const buf = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { buf.set(c, off); off += c.length; }
    return new Blob([buf], { type: mime });
  } catch {
    return null;
  }
}
