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
        title="Technology with room for a whole person."
      >
        <p>
          We are building an environment where reflection, learning,
          relationships, and useful contribution can belong together. Its
          starting point is simple: a person remains the source of meaning in
          their own life.
        </p>
      </PageIntro>
      <div className="public-shell public-article-grid">
        <article className="public-prose">
          <section>
            <h2>What the Arcanum stands for</h2>
            <p>
              Arcanum describes a coherent system of becoming: the ongoing work
              of learning, practicing, reflecting, and taking responsibility.
              Its application is intended to give that work a place without
              reducing a life to engagement metrics.
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
              understand the project and, when a verified release is ready, find
              the application.
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
