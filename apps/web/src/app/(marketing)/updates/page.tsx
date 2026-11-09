import { redirect } from "next/navigation";
import type { Metadata } from "next";
import UpdatesFeed from "@/components/public/UpdatesFeed";
import UpdatesAvailable from "@/components/public/UpdatesAvailable";
import UpdatesTray from "@/components/public/UpdatesTray";
import { PublicShell } from "@/components/public/PublicShell";
import { allUpdatePosts } from "@/lib/update-posts";
import "./updates.css";
export const metadata: Metadata = {
  title: "Arcanum · Follow the developing ARCnet",
  description: "Come back, see what changed, and understand why it matters.",
  applicationName: "Arcanum",
  manifest: "/updates/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Arcanum", statusBarStyle: "default" },
  alternates: { canonical: "https://updates.the-arcanum.net/" },
};
const directions = [
  {
    title: "Make the first moments feel natural",
    meaning: "Refine the opening experience and movement through Arcanum.",
    status: "In private review",
    next: "Human walkthrough findings, any corrections, and a separate release decision.",
    detail:
      "A technically qualified private A20 candidate is separate from the approved public Android release. Downloading or opening it does not establish Human acceptance.",
  },
  {
    title: "Make development easier to follow",
    meaning: "A clearer public window into Arcanum and the Arcanum Network.",
    status: "Preview under review",
    next: "Visitor feedback on readability, navigation and platform clarity.",
    detail:
      "The candidate brings published updates, current availability and anticipated work together. It is not an automatic live feed or an alert service.",
  },
  {
    title: "A private place for Architect review",
    meaning: "Keep owner-only review separate from public reading.",
    status: "Setup pending",
    next: "Secure Google application configuration and real access tests.",
    detail:
      "The owner-only Google sign-in implementation remains unactivated. It is separate from any future public follower account system.",
  },
  {
    title: "Make returning dependable",
    meaning: "Review the complete journey, including continuity and recovery.",
    status: "Qualification open",
    next: "The corresponding Human review and manual two-device recovery evidence.",
    detail:
      "Selected technical results do not close the whole Construction Era wave or certify manual portable recovery.",
  },
];
export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: requested } = await searchParams;
  if (requested === "website") redirect("/updates/archive?category=website");
  if (requested === "history") redirect("/updates/archive");
  const selected =
    requested === "latest" || requested === "app"
      ? "available"
      : requested === "ahead" || requested === "roadmap"
        ? "next"
        : requested === "feed"
          ? "updates"
          : requested;
  const view =
    selected === "available" || selected === "next" ? selected : "updates";
  return (
    <PublicShell
      showFooter={false}
      className="updates-app"
      bottomNavigation={<UpdatesTray active={view} />}
    >
      <div className="updates-hub updates-experience" data-updates-shell="true">
        <header className="updates-heading">
          <div>
            <h1>Arcanum</h1>
            <p className="updates-brand-subtitle">
              Follow the developing ARCnet.
            </p>
            <p className="updates-brand-meaning">
              The Arcanum Network, taking shape through its network and
              experiences.
            </p>
          </div>
        </header>
        {view === "updates" && (
          <section aria-labelledby="development-feed">
            <div className="updates-view-heading">
              <h2 id="development-feed">Watch it take shape.</h2>
              <p>The latest from Arcanum and ARCnet.</p>
            </div>
            <UpdatesFeed posts={allUpdatePosts} />
          </section>
        )}
        {view === "available" && <UpdatesAvailable />}
        {view === "next" && (
          <section aria-labelledby="development-roadmap">
            <div className="updates-view-heading">
              <h2 id="development-roadmap">See what’s taking shape.</h2>
              <p>A look at the work ahead.</p>
            </div>
            <div className="updates-coming-next">
              {directions.map((item) => (
                <details className="updates-direction" key={item.title}>
                  <summary>
                    <span className="updates-status-pill">{item.status}</span>
                    <h3>{item.title}</h3>
                    <p>{item.meaning}</p>
                    <span className="updates-card-action">
                      Explore the next step ↓
                    </span>
                  </summary>
                  <div className="available-expanded">
                    <p>
                      <strong>Next review:</strong> {item.next}
                    </p>
                    <p>{item.detail}</p>
                  </div>
                </details>
              ))}
            </div>
            <p className="updates-footnote">
              Development directions are separate from release commitments. No
              delivery dates are promised, and these cards do not each represent
              the next release.
            </p>
          </section>
        )}
      </div>
    </PublicShell>
  );
}
