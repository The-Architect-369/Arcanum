// src/lib/infra/ipfs.ts

import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { CID } from 'multiformats/cid'

let heliaPromise: ReturnType<typeof createHelia> | null = null

async function getHeliaInstance() {
  if (!heliaPromise) {
    heliaPromise = createHelia()
  }
  return heliaPromise
}

export async function getJSONHelia<T = unknown>(
  cid: string
): Promise<T | null> {
  const helia = await getHeliaInstance()
  const fs = unixfs(helia)

  const parsed = CID.parse(cid)
  const chunks: Uint8Array[] = []

  for await (const chunk of fs.cat(parsed)) {
    chunks.push(chunk)
  }

  const bytes = Buffer.concat(chunks)
  return JSON.parse(bytes.toString()) as T
}

export async function getBlobHelia(cid: string): Promise<Blob> {
  const helia = await getHeliaInstance()
  const fs = unixfs(helia)

  const parsed = CID.parse(cid)
  const chunks: Uint8Array[] = []

  for await (const chunk of fs.cat(parsed)) {
    chunks.push(chunk)
  }

  return new Blob(chunks)
}

export async function putJSONHelia(
  data: unknown
): Promise<{ cid: string }> {
  const helia = await getHeliaInstance()
  const fs = unixfs(helia)

  const bytes = Buffer.from(JSON.stringify(data))
  const cid = await fs.addBytes(bytes)

  return { cid: cid.toString() }
}

export async function putFileHelia(
  file: File
): Promise<{ cid: string }> {
  const helia = await getHeliaInstance()
  const fs = unixfs(helia)

  const bytes = new Uint8Array(await file.arrayBuffer())
  const cid = await fs.addBytes(bytes)

  return { cid: cid.toString() }
}