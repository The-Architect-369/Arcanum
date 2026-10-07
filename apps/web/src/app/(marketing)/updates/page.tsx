import type { Metadata } from "next";
import { PublicShell, PageIntro } from "@/components/public/PublicShell";
import { siteLog } from "@/lib/public-site";
import release from "../../../../public/updates/release.json";
export const metadata: Metadata = {
  title: "Releases and development history",
  alternates: { canonical: "https://updates.the-arcanum.net/" },
  openGraph: {
    title: "Arcanum updates",
    description:
      "Release information, development history, and the evidence behind the build.",
    url: "https://updates.the-arcanum.net/",
  },
};
export default function UpdatesPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Updates / Releases and the work behind them"
        title="See what changed. Follow what comes next."
      >
        <p>
          Inspect the Android release, explore the development record, and
          return to Architect for the wider picture of what is being built.
        </p>
      </PageIntro>
      <section
        className="public-shell public-release-layout"
        aria-labelledby="current-release"
      >
        <div className="public-release-card">
          <span className="public-status">
            Approved Android development release
          </span>
          <h2 id="current-release">Version {release.versionCode}</h2>
          <p>{release.versionName}</p>
          <a className="public-button" href="https://the-arcanum.net/download">
            Review the release and download →
          </a>
          <p className="public-caption">
            Review compatibility, publisher identity, and checksums before
            installing.
          </p>
          <a className="public-text-link" href={release.manifestUrl}>
            Open the release manifest ↗
          </a>
        </div>
        <div className="public-prose">
          <h2>Behind the build</h2>
          <p>
            The repository records integrated changes and their source. Review
            proposals separately from what has reached production.
          </p>
          <ul>
            <li>
              <a href="https://github.com/The-Architect-369/Arcanum/commits/main/">
                Canonical development history
              </a>
            </li>
            <li>
              <a href="https://github.com/The-Architect-369/Arcanum/pulls">
                Open change proposals
              </a>
            </li>
            <li>
              <a href="https://architect.the-arcanum.net/">
                Current state, capabilities, and next work
              </a>
            </li>
          </ul>
        </div>
      </section>
      <div className="public-shell public-journal">
        <h2>Public website journal</h2>
        <p>
          This dated journal records the website’s development. A preview can
          include changes that have not reached production; the build version
          below is not the Android version.
        </p>
        {siteLog.entries.map((entry) => (
          <article key={entry.id}>
            <div>
              <time dateTime={entry.date}>{entry.date}</time>
              <p className="public-label">
                {entry.state === "merged"
                  ? "Recorded integration"
                  : "This website build"}
              </p>
            </div>
            <div>
              <h2>{entry.title}</h2>
              <p>{entry.detail}</p>
              {"pullRequest" in entry && (
                <a className="public-text-link" href={entry.pullRequest}>
                  Review the integration ↗
                </a>
              )}
            </div>
          </article>
        ))}
        <aside className="public-sources">
          <h2>A log you can read or parse</h2>
          <p>
            The dated JSON log identifies this website’s version, editorial
            base, and build revision when available. It is an editorial record,
            not a TEMPUS anchor, an ARCnet receipt, or an APK update manifest.
          </p>
          <a className="public-text-link" href="/site-log.json">
            Open the machine-readable log ↗
          </a>
        </aside>
      </div>
      <div className="public-shell public-section" />
    </PublicShell>
  );
}
