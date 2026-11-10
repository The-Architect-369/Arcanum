import { NextResponse } from "next/server";
import {
  authorizedArchitectSnapshot,
  ArchitectAccessError,
} from "@/lib/architect/authorize";
import { readModel } from "@/lib/architect/model";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Cookie",
};
export async function GET() {
  try {
    const { store } = await authorizedArchitectSnapshot();
    return NextResponse.json(readModel(store), { headers });
  } catch (error) {
    const status = error instanceof ArchitectAccessError ? error.status : 503;
    return NextResponse.json(
      {
        error:
          status === 503
            ? "Workspace authorization or snapshot unavailable."
            : "Architect sign-in and enrollment required.",
      },
      { status, headers },
    );
  }
}
