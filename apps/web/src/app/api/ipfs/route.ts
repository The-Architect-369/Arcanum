import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  // G1 stub: log and return fake CID
  console.log("G1 IPFS stub received:", body);

  return NextResponse.json({
    cid: "bafyG1stubcid",
  });
}
