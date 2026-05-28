import { NextResponse } from "next/server";
import { CID } from "multiformats/cid";
import * as raw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";

export async function POST(request: Request) {
  const bytes = new Uint8Array(await request.arrayBuffer());
  const digest = await sha256.digest(bytes);
  const cid = CID.createV1(raw.code, digest).toString();

  return NextResponse.json({
    cid,
    size: bytes.byteLength,
  });
}
