import { Rss, Smartphone, Route, Globe, Archive } from "lucide-react";
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
  description:
    "Follow Arcanum development, explore the available app, and see what is taking shape.",
  alternates: { canonical: "https://updates.the-arcanum.net/" },
};
// Capability prose must not silently follow a future artifact promotion.
const capabilitiesReviewed =
  release.versionCode === 34 &&
  release.sourceCommit === "75cad68cb3733a44b5b13bcea153f2f77dfa7bda";
const views = [
  { id: "feed", label: "Feed", icon: Rss },
  { id: "app", label: "App", icon: Smartphone },
  { id: "roadmap", label: "Roadmap", icon: Route },
  { id: "website", label: "Website", icon: Globe },
  { id: "history", label: "History", icon: Archive },
] as const;
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
  // Preserve links to the earlier four-section draft.
  const selected =
    requested === "latest"
      ? "app"
      : requested === "updates"
        ? "feed"
        : requested;
  const view = views.find((v) => v.id === selected)?.id ?? "feed";
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
        <nav className="updates-nav" aria-label="Follow Arcanum development">
          {views.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`?view=${id}`}
              aria-current={id === view ? "page" : undefined}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        {view === "feed" && (
          <section aria-labelledby="development-feed">
            <div className="updates-feed-intro">
              <p className="updates-meta">The development thread</p>
              <h2 id="development-feed">Follow Arcanum as it takes shape.</h2>
              <p>
                Release notes, integrated work, and the website’s story. Open an
                entry for its context and source.
              </p>
              <a className="public-text-link" href="?view=app">
                See what the public app can do →
              </a>
            </div>
            <PostRows posts={allUpdatePosts} />
            <p className="updates-footnote">
              This is a dated, curated record. New posts appear after editorial
              review and publication; it is not an automatic report from
              development tools.
            </p>
          </section>
        )}
        {view === "app" && (
          <section aria-labelledby="latest-release">
            <div className="updates-lead">
              <div>
                <p className="updates-meta">
                  Approved Android development release
                </p>
                <h2 id="latest-release">Arcanum for Android</h2>
                <p>
                  Version {release.versionCode} · {release.versionName}
                </p>
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
                {capabilitiesReviewed ? (
                  <>
                    <p>
                      Reviewed Architect conversations and a separate choice to
                      retain answers in development memory.
                    </p>
                    <p>
                      A configured private home gateway and local model are
                      required for conversations.
                    </p>
                    <a href="/updates/a18-public-release">
                      Read the release note →
                    </a>
                  </>
                ) : (
                  <p>
                    A reviewed summary for this release is not yet available.
                    Inspect its manifest and requirements before installing.
                  </p>
                )}
              </div>
            </div>
            <h2 className="updates-section-title">What you can use today</h2>
            {capabilitiesReviewed ? (
              <div className="updates-capabilities">
                <article>
                  <p className="updates-meta">Available offline</p>
                  <h3>Local reflection</h3>
                  <p>
                    Local reflection features work without an AI provider
                    connection.
                  </p>
                </article>
                <article>
                  <p className="updates-meta">Separate setup required</p>
                  <h3>Architect conversations</h3>
                  <p>
                    Reviewed requests use a configured private home gateway and
                    local model. The download does not supply that service.
                  </p>
                </article>
                <article>
                  <p className="updates-meta">Your explicit choice</p>
                  <h3>Development memory</h3>
                  <p>
                    Saving an answer into development memory is a separate
                    reviewed choice.
                  </p>
                </article>
                <article>
                  <p className="updates-meta">Not activated</p>
                  <h3>Chain services</h3>
                  <p>
                    This development release does not activate chain services or
                    confer network rights.
                  </p>
                </article>
              </div>
            ) : (
              <p>
                Capabilities for this artifact need a fresh editorial review;
                earlier release descriptions are not proof of its behavior.
              </p>
            )}
            <h2 className="updates-section-title">
              Integrated work is separate
            </h2>
            <PostRows posts={developmentPosts.slice(0, 1)} />
            <p className="updates-footnote">
              Newer local testing builds are separate from the approved
              download. Private testing access belongs in the signed-in
              Architect workspace.
            </p>
          </section>
        )}
        {view === "roadmap" && (
          <section aria-labelledby="development-roadmap">
            <p className="updates-meta">
              Anticipated work · reviewed November 9, 2026
            </p>
            <h2 id="development-roadmap" className="updates-section-title">
              What’s taking shape
            </h2>
            <p>
              These are development directions and open gates, not release
              commitments. No delivery dates are promised.
            </p>
            <div className="updates-roadmap">
              <article>
                <span className="updates-meta">Private review</span>
                <h3>A20 navigation and the first-opening experience</h3>
                <p>
                  A separately qualified review build is awaiting the Human
                  walkthrough and acceptance. It is not the approved public
                  download.
                </p>
                <p className="updates-footnote">
                  Next gate: review findings, any corrections, and a separate
                  release decision.
                </p>
              </article>
              <article>
                <span className="updates-meta">This website candidate</span>
                <h3>A place to follow development</h3>
                <p>
                  The five-section Updates experience brings together the
                  development feed, available app features, anticipated work,
                  website changes and history.
                </p>
                <p className="updates-footnote">
                  Next gate: visual and mobile review, then adoption and
                  publication.
                </p>
              </article>
              <article>
                <span className="updates-meta">Activation pending</span>
                <h3>Private Architect access</h3>
                <p>
                  Owner-only Google sign-in has a local implementation. Google
                  application setup and real sign-in tests are still required;
                  it is not an open registration system.
                </p>
                <p className="updates-footnote">
                  Next gate: secure provider configuration and access
                  verification.
                </p>
              </article>
              <article>
                <span className="updates-meta">Qualification still open</span>
                <h3>The complete participant journey</h3>
                <p>
                  Human usability acceptance and manual two-device recovery
                  remain distinct checks. Selected technical passes do not close
                  the whole Construction Era wave.
                </p>
                <p className="updates-footnote">
                  Next gate: the corresponding evidence and Human acceptance.
                </p>
              </article>
            </div>
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
