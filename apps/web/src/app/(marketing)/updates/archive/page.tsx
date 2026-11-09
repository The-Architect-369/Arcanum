import UpdatesTray from "@/components/public/UpdatesTray";
import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import UpdateRows from "@/components/public/UpdateRows";
import { allUpdatePosts } from "@/lib/update-posts";
import "../updates.css";
export const metadata: Metadata = {
  title: "Updates archive",
  manifest: "/updates/manifest.webmanifest",
};
export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const posts =
    category === "website"
      ? allUpdatePosts.filter((p) => p.category === "website")
      : allUpdatePosts;
  return (
    <PublicShell
      showFooter={false}
      className="updates-app"
      bottomNavigation={<UpdatesTray />}
    >
      <section
        className="updates-detail updates-history"
        data-updates-shell="true"
      >
        <a href="/updates">← Back to Updates</a>
        <h1>
          {category === "website" ? "Website journal" : "Updates archive"}
        </h1>
        <p>
          Earlier dated records live here so the main thread can stay focused.
          These entries describe their original context, not today’s
          availability.
        </p>
        <p>
          <a href="/updates/archive">All records</a> ·{" "}
          <a href="/updates/archive?category=website">Website only</a>
        </p>
        {Array.from(new Set(posts.map((p) => p.date.slice(0, 7)))).map(
          (month) => (
            <details key={month}>
              <summary>
                {month} · {posts.filter((p) => p.date.startsWith(month)).length}{" "}
                entries
              </summary>
              <UpdateRows
                posts={posts.filter((p) => p.date.startsWith(month))}
              />
            </details>
          ),
        )}
        <p className="updates-footnote">
          A selected editorial archive, not a complete release inventory.{" "}
          <a href="/site-log.json">Machine-readable website journal</a>.
        </p>
      </section>
    </PublicShell>
  );
}
