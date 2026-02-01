import "server-only";
import { NextResponse } from "next/server";

export async function POST() {
  const helia = await createHeliaNode();
  // TODO: implement IPFS logic
  return NextResponse.json({ ok: true });
}
