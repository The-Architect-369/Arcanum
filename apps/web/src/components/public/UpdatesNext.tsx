import CurrentCards from "./CurrentCards";
import { source } from "@/lib/public-site";
export default function UpdatesNext() {
  return (
    <section aria-labelledby="development-roadmap">
      <CurrentCards
        label="Development library"
        entries={[
          {
            id: "application",
            topic: "arcanum",
            title: "The application",
            summary:
              "A place for reflection, conversation and returning to what matters.",
            status: "Integrated work · review continues",
            action: "Explore the application",
            content: (
              <>
                <p className="updates-panel-lead">
                  Make everyday reflection feel natural and dependable.
                </p>
                <div className="current-project">
                  <h3>Reflections and continuity</h3>
                  <p>
                    <strong>Today:</strong> the approved Android release offers
                    local reflection. Newer reflection collections are recorded
                    as integrated source, with public availability separate.
                  </p>
                  <p>
                    <strong>Work ahead:</strong> refine the opening experience
                    and returning to saved work.
                  </p>
                  <p>
                    <strong>Next review:</strong> Human walkthrough findings,
                    corrections and a separate release decision. Manual
                    two-device recovery qualification remains open.
                  </p>
                  <a
                    className="current-action"
                    href="/updates/a19-core-integrated"
                  >
                    Read the published development update →
                  </a>
                </div>
                <div className="current-project">
                  <h3>HOPE</h3>
                  <p>
                    Explore the purpose and boundaries of the reflective
                    interface. The public introduction is an explanation, not a
                    live conversation service.
                  </p>
                  <a
                    className="current-action"
                    href="https://the-arcanum.net/explore/hope"
                  >
                    Explore HOPE →
                  </a>
                </div>
              </>
            ),
          },
          {
            id: "technology",
            topic: "arcnet",
            title: "ARCnet technology",
            summary:
              "The foundations that connect time, provenance and human choice.",
            status: "Contracts and local runtime work",
            action: "Explore the foundations",
            content: (
              <>
                <p className="updates-panel-lead">
                  Understand the structures behind the Arcanum Network.
                </p>
                <div className="current-project">
                  <h3>TEMPUS</h3>
                  <p>
                    <strong>Today:</strong> temporal provenance contracts and
                    local runtime work exist. The wider astronomical and
                    participant experience is still developing.
                  </p>
                  <p>
                    <strong>Work ahead:</strong> connect useful time and place
                    context without assigning human worth or permission.
                  </p>
                  <p>
                    <strong>Next milestone:</strong> review each proposed
                    experience against its implementation and qualification
                    evidence before describing it as available.
                  </p>
                  <a
                    className="current-action"
                    href="https://the-arcanum.net/explore/tempus"
                  >
                    Explore the public TEMPUS introduction →
                  </a>
                  <p>
                    <a href={source("docs/specs/tempus/tempus-anchor.md")}>
                      Read the implementation contract ↗
                    </a>
                  </p>
                </div>
                <p>
                  Native downloads do not activate network services. Forum and
                  Nexus participation remain future direction; no private social
                  service or security guarantee is offered here.
                </p>
              </>
            ),
          },
          {
            id: "web",
            topic: "website",
            title: "Web experiences",
            summary: "A clear public window into the work, useful on its own.",
            status: "Current preview under review",
            action: "Explore the web experiences",
            content: (
              <>
                <p className="updates-panel-lead">
                  Make it easier to discover the project and stay current.
                </p>
                <div className="current-project">
                  <h3>Arcanum Current</h3>
                  <p>
                    <strong>Today:</strong> published updates, availability
                    guidance and this public development library form one
                    browser experience.
                  </p>
                  <p>
                    <strong>Work ahead:</strong> refine mobile reading,
                    navigation and installation.
                  </p>
                  <p>
                    <strong>Next review:</strong> Human feedback on this preview
                    and real-device checks. Following badges, accounts and
                    alerts require separate functional work.
                  </p>
                  <a
                    className="current-action"
                    href="/updates/archive?category=website"
                  >
                    Read the website journal →
                  </a>
                </div>
                <div className="current-project">
                  <h3>The main website</h3>
                  <p>
                    Introductions explain the project’s purposes and source
                    boundaries. This informational site is separate from native
                    application functionality.
                  </p>
                  <a className="current-action" href="https://the-arcanum.net/">
                    Explore Arcanum’s public website ↗
                  </a>
                </div>
              </>
            ),
          },
        ]}
      />
      <p className="updates-footnote">
        Public resources only. Connecting selected material from the offline
        library requires a separate review. Directions are not release promises.
      </p>
    </section>
  );
}
