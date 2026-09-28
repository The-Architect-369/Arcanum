import { siteLog } from "@/lib/public-site";
export const dynamic = "force-static";
export function GET() {
  return Response.json(
    { ...siteLog, buildCommit: process.env.VERCEL_GIT_COMMIT_SHA || null },
    { headers: { "Cache-Control": "public, max-age=0, must-revalidate" } },
  );
}
