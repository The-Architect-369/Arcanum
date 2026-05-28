"use client";

import { CID } from "multiformats/cid";
import * as raw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";
import {
  getIPFSFileRecord,
  getIPFSJsonRecord,
  putIPFSFileRecord,
  putIPFSJsonRecord,
} from "@/lib/mobile/persistence";

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("IPFS persistence is only available in the browser.");
  }
}

async function bytesToCid(bytes: Uint8Array) {
  const digest = await sha256.digest(bytes);
  return CID.createV1(raw.code, digest).toString();
}

export async function getJSONHelia<T = unknown>(cid: string): Promise<T | null> {
  return getIPFSJsonRecord<T>(cid);
}

export async function getBlobHelia(cid: string): Promise<Blob> {
  const record = await getIPFSFileRecord(cid);
  if (!record) {
    throw new Error(`Blob not found for CID: ${cid}`);
  }
  return record.blob;
}

export async function putJSONHelia(data: unknown): Promise<{ cid: string }> {
  ensureBrowser();

  const text = JSON.stringify(data);
  const cid = await bytesToCid(new TextEncoder().encode(text));
  await putIPFSJsonRecord(cid, data, text);

  return { cid };
}

export async function putFileHelia(file: File): Promise<{ cid: string }> {
  ensureBrowser();

  const bytes = new Uint8Array(await file.arrayBuffer());
  const cid = await bytesToCid(bytes);
  await putIPFSFileRecord(
    cid,
    new Blob([bytes], { type: file.type || "application/octet-stream" }),
    {
      name: file.name,
      mime: file.type || "application/octet-stream",
    }
  );

  return { cid };
}
