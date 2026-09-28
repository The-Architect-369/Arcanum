import type { Metadata } from "next";
import {
  PublicShell,
  PageIntro,
  SourceList,
} from "@/components/public/PublicShell";
export const metadata: Metadata = {
  title: "Principles & sources",
  alternates: { canonical: "/principles" },
};
export default function PrinciplesPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Principles / The commitments"
        title="The boundaries are part of the design."
      >
        <p>
          What a system refuses to do matters as much as what it enables.
          Arcanum’s doctrine and constitutions define constraints that its
          interfaces, economics, and network must respect.
        </p>
      </PageIntro>
      <div className="public-shell public-article-grid">
        <article className="public-prose">
          <section>
            <h2>Your agency stays with you</h2>
            <p>
              Participation is voluntary. Identity cannot be owned by the
              application, traded, or collapsed into a reputation score. Consent
              applies to a defined action; it cannot silently become permission
              for everything else.
            </p>
          </section>
          <section>
            <h2>Time never judges</h2>
            <p>
              Windows and cycles offer opportunities. Missed windows carry no
              penalty, and timing cannot imply intent. Growth and readiness
              belong to lived experience.
            </p>
          </section>
          <section>
            <h2>Worth is outside the scoreboard</h2>
            <p>
              Learning can be structured and contribution can be compensated.
              Neither recognition nor an economic balance establishes the value
              of a person. Private reflection cannot determine a reward amount.
            </p>
          </section>
          <section>
            <h2>Every layer has limits</h2>
            <p>
              Doctrine constrains the system. Governance defines bounded change
              processes. Protocol witnesses facts and enforces invariants.
              Applications present and request actions. Lived experience remains
              the source of personal meaning.
            </p>
          </section>
          <section>
            <h2>Changes leave a trail</h2>
            <p>
              The public repository records proposals and reviewed changes. This
              website summarizes selected sources and keeps a dated editorial
              log. Website copy cannot amend the controlling canon. Future
              changes must remain reviewable through their proper channels.
            </p>
          </section>
        </article>
        <SourceList
          sources={[
            {
              label: "Layer boundaries · canonical",
              path: "docs/doctrine/layer-boundaries.md",
            },
            {
              label: "Identity Model · canonical",
              path: "docs/doctrine/identity-model.md",
            },
            {
              label: "Temporal Model · canonical",
              path: "docs/doctrine/temporal-model.md",
            },
            {
              label: "Dignity & content boundaries",
              path: "docs/compliance/dignity-content-boundaries.md",
            },
            {
              label: "Economic Constitution · canonical",
              path: "docs/economics/economic-constitution.md",
            },
            {
              label: "Governance specification",
              path: "docs/governance/governance-specification.md",
            },
            { label: "Documentation index", path: "docs/index.md" },
          ]}
        />
      </div>
      <div className="public-shell public-section" />
    </PublicShell>
  );
}
