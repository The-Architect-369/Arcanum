import type { Metadata } from "next";
import { PageIntro, PublicShell } from "@/components/public/PublicShell";

const base = "6b5a69febba492b9e157628ef512f0de22ca3486";
const repo = "https://github.com/The-Architect-369/Arcanum";
const record = (path: string) => `${repo}/blob/${base}/${path}`;

export const metadata: Metadata = {
  title: "Architect · Development dashboard",
  description:
    "A public view of Arcanum development, source records, and the next bounded work.",
  alternates: { canonical: "https://architect.the-arcanum.net/" },
  openGraph: {
    title: "Architect · Development dashboard",
    description:
      "Follow Arcanum development and inspect the evidence behind its status.",
    url: "https://architect.the-arcanum.net/",
  },
};

export default function ArchitectPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Architect / Public development view"
        title="Follow the build."
      >
        <p>
          See where Arcanum stands, what comes next, and the records behind the
          work.
        </p>
      </PageIntro>
      <section
        className="public-shell public-release-layout"
        aria-labelledby="development-status"
      >
        <div className="public-release-card">
          <span className="public-status">Construction Era · CE-W04 open</span>
          <h2 id="development-status">A18 closed. A19 next.</h2>
          <p>
            A18 closed within its accepted local Architect conversation and
            Android development release scope. A19 prepares protected
            collections of Hope reflections; its implementation and physical
            acceptance work remain ahead.
          </p>
          <a
            className="public-text-link"
            href={record(
              "docs/evidence/ce-w04-a18-local-20261003/closure-review.md",
            )}
          >
            Read the A18 closure evidence ↗
          </a>
        </div>
        <div className="public-prose">
          <h2>Two starting points</h2>
          <p>
            The current-state view brings selected evidence together. The
            capability registry records tested access, behavior, and limits.
            Both are dated records that need fresh verification before action.
          </p>
          <ul>
            <li>
              <a href={record("docs/governance/architectgpt/current-state.md")}>
                Derived current state
              </a>
            </li>
            <li>
              <a
                href={record(
                  "docs/governance/architectgpt/operational-capabilities.md",
                )}
              >
                Operational capabilities
              </a>
            </li>
            <li>
              <a href={`${repo}/commits/main/`}>
                Latest canonical repository history
              </a>
            </li>
          </ul>
          <p>
            Snapshot reviewed October 7, 2026 at repository revision{" "}
            <code>{base.slice(0, 8)}</code>. The linked projection includes
            older observations; it is not a live feed or a claim that every
            recorded provider status remains current.
          </p>
        </div>
      </section>
      <section
        className="public-shell public-journal"
        aria-labelledby="development-next"
      >
        <h2 id="development-next">The work ahead</h2>
        <article>
          <p className="public-label">Next / A19</p>
          <div>
            <h3>A protected reflection collection</h3>
            <p>
              Migration, chronological recall, deletion, and corruption handling
              remain the bounded storage scope. Hope model access is a separate
              proposed extension.
            </p>
          </div>
        </article>
        <article>
          <p className="public-label">Following / A20</p>
          <div>
            <h3>Accessible navigation</h3>
            <p>
              Geometric views and accessible controls should reach the same
              destinations. Wider spatial-semantic extensions remain proposals.
            </p>
          </div>
        </article>
        <article>
          <p className="public-label">Parallel / Journeys</p>
          <div>
            <h3>A reusable pathway</h3>
            <p>
              The Great Journey starts with a clearly marked pilot outline while
              Arcanum remains the primary development lane.
            </p>
            <a
              className="public-text-link"
              href="https://journeys.the-arcanum.net/"
            >
              Explore The Great Journey →
            </a>
          </div>
        </article>
        <aside className="public-sources">
          <h2>Public today. Scoped collaboration ahead.</h2>
          <p>
            This view offers public information and source links. It has no
            development execution controls. The intended future workspace
            includes sign-in and separately verified, scoped architect
            permissions before shared changes can be made. That access system is
            not implemented here.
          </p>
          <p>
            A grade, title, or wallet connection alone does not authorize
            changes to another person’s data, shared funds, or releases.
          </p>
          <a
            className="public-text-link"
            href={record("docs/architecture/participant-journey-proposal.md")}
          >
            Read the contribution proposal ↗
          </a>
        </aside>
      </section>
      <div className="public-shell public-section" />
    </PublicShell>
  );
}
