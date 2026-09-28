import type { Metadata } from "next";
import {
  PublicShell,
  PageIntro,
  PillarCards,
} from "@/components/public/PublicShell";
export const metadata: Metadata = {
  title: "Explore the pillars",
  alternates: { canonical: "/explore" },
};
export default function ExplorePage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Explore / The pillars"
        title="Find your way into Arcanum."
      >
        <p>
          Start with the part that speaks to you: rhythm, reflection, learning,
          shared infrastructure, or meaningful exchange. These five
          introductions describe complementary roles, not a new constitutional
          hierarchy.
        </p>
      </PageIntro>
      <section
        className="public-shell public-section public-section-tight"
        aria-label="Five pillars"
      >
        <h2 className="sr-only">Five ways into Arcanum</h2>
        <PillarCards />
      </section>
      <section className="public-shell public-section public-two-col">
        <h2>A wider constellation.</h2>
        <div>
          <p className="public-intro">
            Identity preserves continuity. Nexus frames connection and
            discourse. The wallet presents custody and transactions. Treasury
            supports shared stewardship, while Architect and governance keep
            changes accountable to doctrine.
          </p>
          <p>
            These roles remain distinct in the canonical module registry. The
            five featured pillars are an editorial path into that larger system.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
