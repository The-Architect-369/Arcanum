import type { Metadata } from "next";
import Link from "next/link";
import {
  PublicShell,
  PageIntro,
  SourceList,
} from "@/components/public/PublicShell";
export const metadata: Metadata = {
  title: "The vision",
  alternates: { canonical: "/about" },
};
export default function AboutPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="The vision / Arcanum & ARCnet"
        title="A wider world. Your own way through."
      >
        <p>
          Look up. There are places to notice, questions to follow, and
          practices to try. Arcanum is being built to give discovery,
          reflection, and learning a place in everyday life. What you make of
          that journey remains yours.
        </p>
      </PageIntro>
      <div className="public-shell public-article-grid">
        <article className="public-prose">
          <section>
            <h2>What the Arcanum stands for</h2>
            <p>
              Follow a question. Try a practice. Return to a moment and see what
              has changed. Arcanum brings learning and reflection into the same
              journey, with room to keep your experience private.
            </p>
            <p>
              Human sovereignty, reciprocity, harmony, and provenance shape the
              project. Participation is voluntary. Recognition must preserve
              dignity. A record should make its source and limits visible.
            </p>
          </section>
          <section>
            <h2>Two names, distinct roles</h2>
            <p>
              Arcanum is the application experience. ARCnet is the developing
              network for continuity, factual witnessing, and governed exchange
              beneath it. The public website is the threshold: a place to
              understand the project and inspect its verified Android
              development candidate.
            </p>
          </section>
          <section>
            <h2>A structure for lived experience</h2>
            <p>
              HOPE supports reflection. TEMPUS provides temporal context. Vitae
              describes learning and recognition of sustained capacity. Nexus
              describes connection. MANA and ARCnet provide the designed
              economic and settlement foundations. Each role is bounded so that
              no single part can claim authority over the whole person.
            </p>
          </section>
          <section>
            <h2>Geometry as a visual language</h2>
            <p>
              Cycles, intersecting circles, and the Flower lattice express
              relationship and orientation in the project’s design. They are
              intentional symbols and architectural hypotheses. They make no
              claim about your destiny, worth, or rights; every idea must also
              be understandable in ordinary language.
            </p>
          </section>
          <section>
            <h2>Built openly, still Pre-Genesis</h2>
            <p>
              The repository contains doctrine, constitutions, module designs,
              local runtime work, and an evolving native host. Those sources
              have different statuses. A published design is not proof that a
              public network or every described experience is operational.
            </p>
            <Link className="public-text-link" href="/updates">
              Follow the public journal →
            </Link>
          </section>
        </article>
        <SourceList
          sources={[
            {
              label: "System overview · canonical",
              path: "docs/architecture/arcanum-system-overview.md",
            },
            {
              label: "Canonical modules",
              path: "docs/architecture/canonical-modules.md",
            },
            {
              label: "Manifesto · developing outline",
              path: "docs/manifesto/arcanum-manifesto.md",
            },
            {
              label: "Metaphysical neutrality · canonical",
              path: "docs/doctrine/metaphysical-neutrality.md",
            },
          ]}
        />
      </div>
      <div className="public-shell public-section">
        <Link className="public-button" href="/explore">
          Explore the pillars ↗
        </Link>
      </div>
    </PublicShell>
  );
}
