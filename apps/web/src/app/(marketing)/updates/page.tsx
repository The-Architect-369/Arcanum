import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import {
  allUpdatePosts,
  developmentPosts,
  websitePosts,
  type UpdatePost,
} from "@/lib/update-posts";
import release from "../../../../public/updates/release.json";
import "./updates.css";
export const metadata: Metadata = {
  title: "Arcanum Updates",
  description: "Releases, development notes and the website’s story.",
  alternates: { canonical: "https://updates.the-arcanum.net/" },
};
const views = ["latest", "updates", "website", "history"] as const;
function PostRows({ posts }: { posts: UpdatePost[] }) {
  return (
    <div className="updates-list">
      {posts.map((post) => (
        <a className="updates-row" href={`/updates/${post.id}`} key={post.id}>
          <time dateTime={post.date}>{post.date}</time>
          <div>
            <span className="updates-meta">{post.status}</span>
            <h3>{post.title}</h3>
          </div>
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: requested } = await searchParams;
  const view = views.find((v) => v === requested) ?? "latest";
  return (
    <PublicShell>
      <div className="updates-hub">
        <header className="updates-heading">
          <div>
            <p className="public-eyebrow">Arcanum / Follow the work</p>
            <h1>Arcanum Updates</h1>
            <p>What’s available. What’s changing. A trail you can follow.</p>
          </div>
          <a
            className="updates-owner-link"
            href="https://architect.the-arcanum.net/architect/login"
          >
            Architect sign-in ↗
          </a>
        </header>
        <nav className="updates-nav" aria-label="Updates sections">
          {views.map((v) => (
            <a
              key={v}
              href={`?view=${v}`}
              aria-current={v === view ? "page" : undefined}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </a>
          ))}
        </nav>
        {view === "latest" && (
          <section aria-labelledby="latest-release">
            <div className="updates-lead">
              <div>
                <p className="updates-meta">
                  Approved Android development release
                </p>
                <h2 id="latest-release">Arcanum for Android</h2>
                <p>Version {release.versionCode} · A18</p>
                <p>
                  Review the requirements and release details before you
                  install.
                </p>
                <a
                  className="public-button"
                  href="https://the-arcanum.net/download"
                >
                  Review and download →
                </a>
              </div>
              <div>
                <h2>What’s changed</h2>
                <p>
                  Reviewed Architect conversations and a separate choice to
                  retain answers in development memory.
                </p>
                <p>
                  A configured private home gateway and local model are required
                  for conversations.
                </p>
                <a href="/updates/a18-public-release">
                  Read the release note →
                </a>
              </div>
            </div>
            <h2 className="updates-section-title">From development</h2>
            <PostRows posts={developmentPosts.slice(0, 1)} />
            <p className="updates-footnote">
              Newer local testing builds are separate from the approved
              download. Private testing access belongs in the signed-in
              Architect workspace.
            </p>
          </section>
        )}
        {view === "updates" && (
          <section aria-labelledby="development-notes">
            <h2 id="development-notes" className="updates-section-title">
              Development notes
            </h2>
            <PostRows posts={developmentPosts} />
            <p className="updates-footnote">
              <a href="https://github.com/The-Architect-369/Arcanum/commits/main/">
                Source history ↗
              </a>{" "}
              ·{" "}
              <a href="https://github.com/The-Architect-369/Arcanum/pulls">
                Change proposals ↗
              </a>
            </p>
          </section>
        )}
        {view === "website" && (
          <section aria-labelledby="website-notes">
            <h2 id="website-notes" className="updates-section-title">
              The website’s story
            </h2>
            <p>
              Dated editorial notes about the web experience. Website versions
              are separate from Android releases.
            </p>
            <PostRows posts={websitePosts} />
            <p className="updates-footnote">
              <a href="/site-log.json">Machine-readable website journal ↗</a>
            </p>
          </section>
        )}
        {view === "history" && (
          <section className="updates-history" aria-labelledby="update-history">
            <h2 id="update-history" className="updates-section-title">
              Browse the record
            </h2>
            <p>
              Expand a month, then choose an entry. This is the selected
              editorial record, not an exhaustive release archive.
            </p>
            {Array.from(
              new Set(allUpdatePosts.map((p) => p.date.slice(0, 7))),
            ).map((month) => (
              <details key={month}>
                <summary>
                  {month} ·{" "}
                  {
                    allUpdatePosts.filter((p) => p.date.startsWith(month))
                      .length
                  }{" "}
                  entries
                </summary>
                <PostRows
                  posts={allUpdatePosts.filter((p) => p.date.startsWith(month))}
                />
              </details>
            ))}
          </section>
        )}
      </div>
    </PublicShell>
  );
}
