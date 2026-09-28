import type { Metadata } from "next";
import { PublicShell, PageIntro } from "@/components/public/PublicShell";
import { repository } from "@/lib/public-site";
export const metadata: Metadata = {
  title: "Get Arcanum",
  alternates: { canonical: "/download" },
};
export default function DownloadPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="Get Arcanum / Android"
        title="A considered first step."
      >
        <p>
          Android is the first native host for Arcanum. The public package will
          arrive here with the information you need to identify and verify it.
        </p>
      </PageIntro>
      <section className="public-shell public-release-layout">
        <div className="public-release-card">
          <span className="public-status">Release pending</span>
          <h2>Download Arcanum</h2>
          <p>
            APK publication is paused while we refine the public website. No
            public APK has been approved and verified for distribution here.
          </p>
          <span className="public-unavailable">Download not yet available</span>
          <p className="public-caption">
            There is no installer behind this label.
          </p>
        </div>
        <div className="public-prose">
          <h2>What will accompany a release</h2>
          <ul>
            <li>The exact Android version and signed APK.</li>
            <li>A SHA-256 checksum and signer fingerprint.</li>
            <li>The source revision and build provenance.</li>
            <li>
              Compatibility information and clear verification instructions.
            </li>
          </ul>
          <p>
            Downloading, inspecting, and installing are separate actions. A
            successful preflight does not grant installation approval.
          </p>
          <h3>A separate update channel</h3>
          <p>
            The proposed machine update channel at{" "}
            <code>updates.the-arcanum.net</code> is not established by this
            website. It still requires its own distribution and artifact
            verification gates. The public site log records editorial changes
            only.
          </p>
          <a className="public-text-link" href={repository}>
            Inspect the source ↗
          </a>
        </div>
      </section>
    </PublicShell>
  );
}
