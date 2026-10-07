import type { Metadata } from "next";
import { PageIntro, PublicShell } from "@/components/public/PublicShell";

export const metadata: Metadata = {
  title: "The Great Journey",
  description:
    "Journeys through places, ideas, and practice. Explore the first pilot taking shape within Arcanum.",
  alternates: { canonical: "https://journeys.the-arcanum.net/" },
  openGraph: {
    title: "The Great Journey",
    description:
      "Places to explore. Questions to carry. Room to find your own way.",
    url: "https://journeys.the-arcanum.net/",
  },
};

const stages = [
  [
    "Orient",
    "Choose a question to carry. Begin with the place, its context, and what you hope to explore.",
  ],
  [
    "Investigate",
    "Follow the Tesla research theme through attributable sources. Keep historical evidence separate from later stories.",
  ],
  [
    "Notice",
    "Make room for landscape and observation. Choose a pace and activities that suit you.",
  ],
  [
    "Listen",
    "Consider the wider cultural context and whose perspectives are represented in the story.",
  ],
  [
    "Return",
    "Revisit the opening question. Decide what you want to carry forward and what can remain unfinished.",
  ],
];

export default function JourneysPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="The Great Journey / An Arcanum project"
        title="Go somewhere. Come back with a question."
      >
        <p>
          Explore a place, follow an idea, or learn a practice. A Journey gives
          you a starting point and room to find your own way.
        </p>
      </PageIntro>
      <section
        className="public-shell public-release-layout"
        aria-labelledby="journey-pilot"
      >
        <div className="public-release-card">
          <span className="public-status">Pilot in preparation</span>
          <h2 id="journey-pilot">Colorado Springs: a Tesla-inspired journey</h2>
          <p>
            A proposed five-part exploration of curiosity, history, place, and
            reflection.
          </p>
          <a className="public-button" href="#journey-outline">
            Explore the outline ↓
          </a>
          <p className="public-caption">
            This is an early outline. A sourced itinerary with locations, access
            details, and practical travel information is still being prepared.
          </p>
        </div>
        <div className="public-prose">
          <h2>A pathway you can make your own</h2>
          <p>
            Each Journey can bring together a guiding question, a sequence of
            experiences, sources to explore, and opportunities to reflect. You
            choose your pace and what matters to you.
          </p>
          <p>
            Travel is one starting point. The wider idea includes learning,
            vocational exploration, and creative practice. This first pilot
            helps shape a reusable format.
          </p>
          <h2>Part of Arcanum</h2>
          <p>
            The Great Journey develops alongside Arcanum. It offers a way into
            exploration while the application and ARCnet continue to take shape.
          </p>
          <a className="public-text-link" href="https://the-arcanum.net/">
            Discover Arcanum →
          </a>
        </div>
      </section>
      <section
        id="journey-outline"
        className="public-shell public-journal"
        aria-labelledby="journey-outline-title"
      >
        <h2 id="journey-outline-title">Five parts. Your own pace.</h2>
        {stages.map(([title, description], index) => (
          <article key={title}>
            <p className="public-label">Part {index + 1}</p>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </article>
        ))}
        <aside className="public-sources">
          <h2>What comes next</h2>
          <p>
            The pilot needs documented sources, practical access checks, and a
            reviewed itinerary before it becomes a travel guide. Any future
            affiliate links will be clearly disclosed. There are no booking or
            affiliate links in this outline.
          </p>
        </aside>
      </section>
      <div className="public-shell public-section" />
    </PublicShell>
  );
}
