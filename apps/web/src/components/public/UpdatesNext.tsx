import type { ReactNode } from "react";
import CurrentCards from "./CurrentCards";
import { source } from "@/lib/public-site";

function ProjectCard({
  title,
  status,
  children,
}: {
  title: string;
  status: string;
  children: ReactNode;
}) {
  return (
    <article className="roadmap-project">
      <h3>{title}</h3>
      <span className="updates-status-pill">{status}</span>
      {children}
    </article>
  );
}

export default function UpdatesNext() {
  return (
    <section className="roadmap" aria-labelledby="development-roadmap">
      <h1 className="sr-only" id="development-roadmap">
        Coming next
      </h1>
      <CurrentCards
        label="Development domains"
        entries={[
          {
            id: "application",
            topic: "arcanum",
            title: "Application",
            summary: "Reflect on your phone and return to saved work.",
            content: (
              <>
                <ProjectCard
                  title="Returning to reflections"
                  status="Walkthrough ahead"
                >
                  <p>
                    The next walkthrough follows the path from opening Arcanum
                    to finding a saved reflection. Reflection collections are
                    integrated in the source and await a public release
                    decision.
                  </p>
                  <a
                    className="current-action"
                    href="/updates/a19-core-integrated"
                  >
                    Read the reflection collections update →
                  </a>
                </ProjectCard>
                <ProjectCard
                  title="Recovering saved work"
                  status="Device check pending"
                >
                  <p>
                    Manual recovery testing across two devices remains open. The
                    next check is whether a saved reflection can be recovered on
                    the second device.
                  </p>
                </ProjectCard>
              </>
            ),
          },
          {
            id: "technology",
            topic: "arcnet",
            title: "ARCnet technology",
            summary: "Follow the work on time, place and provenance.",
            content: (
              <>
                <ProjectCard
                  title="Time and place in Tempus"
                  status="Local runtime in development"
                >
                  <p>
                    Tempus has a local runtime and a contract for recording
                    time. The work ahead connects that record to place so a
                    participant can understand when and where something
                    happened.
                  </p>
                  <a
                    className="current-action"
                    href={source("docs/specs/tempus/tempus-anchor.md")}
                  >
                    Read the Tempus contract ↗
                  </a>
                </ProjectCard>
                <ProjectCard title="The participant view" status="Review ahead">
                  <p>
                    The next review checks which parts of the proposed
                    astronomical experience a participant can actually see and
                    use in the build.
                  </p>
                  <a
                    className="current-action"
                    href="https://the-arcanum.net/explore/tempus"
                  >
                    Explore Tempus →
                  </a>
                </ProjectCard>
              </>
            ),
          },
          {
            id: "web",
            topic: "website",
            title: "Web experiences",
            summary: "Follow mobile reading, navigation and installation.",
            content: (
              <>
                <ProjectCard
                  title="Reading Current on a phone"
                  status="Preview in review"
                >
                  <p>
                    The phone walkthrough checks the space each card gets, how
                    the feed scrolls and where you land when you return from a
                    domain.
                  </p>
                  <a
                    className="current-action"
                    href="/updates/archive?category=website"
                  >
                    Read the website journal →
                  </a>
                </ProjectCard>
                <ProjectCard
                  title="Installing Current"
                  status="Device review ahead"
                >
                  <p>
                    The next installation check follows the web app option under
                    Available and reviews its guidance on a phone.
                  </p>
                </ProjectCard>
              </>
            ),
          },
        ]}
      />
    </section>
  );
}
