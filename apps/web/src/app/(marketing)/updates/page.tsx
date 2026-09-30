import type { Metadata } from "next";
import { PublicShell, PageIntro } from "@/components/public/PublicShell";
import { siteLog } from "@/lib/public-site";
export const metadata: Metadata = {
  title: "Public journal",
  alternates: { canonical: "/updates" },
};
export default function UpdatesPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Journal / A recorded evolution"
        title="An open work, with a visible history."
      >
        <p>
          This journal records the public website’s development. The version
          shown belongs to this build; a preview can contain changes that have
          not yet reached production.
        </p>
      </PageIntro>
      <div className="public-shell public-journal">
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
