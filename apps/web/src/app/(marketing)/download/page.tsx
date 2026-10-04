import type { Metadata } from "next";
import { PublicShell, PageIntro } from "@/components/public/PublicShell";
import release from "../../../../public/updates/release.json";
export const metadata: Metadata = { title: "Get Arcanum", alternates: { canonical: "/download" } };
export default function DownloadPage() {
  return (
    <PublicShell>
      <PageIntro eyebrow="Get Arcanum / Android" title="Take Arcanum with you.">
        <p>Download the approved Android development release, or update your existing installation.</p>
      </PageIntro>
      <section className="public-shell public-release-layout">
        <div className="public-release-card">
          <span className="public-status">Approved development release</span>
          <h2>Arcanum for Android</h2>
          <p>Version {release.versionCode} · {release.versionName}. Android 8 or later, ARM64 or x86_64.</p>
          <a className="public-button" href={release.apkUrl}>Download or update Arcanum</a>
          <p className="public-caption">Keep your existing app installed. Open this APK and confirm the update with Android; do not uninstall to update.</p>
        </div>
        <div className="public-prose">
          <h2>Updates that preserve your place</h2>
          <p>The website and the app use the same approved release listing. In Architect, open Arcanum updates and choose “Check for approved update.” Review the download before confirming installation. A newer development build will not be downgraded.</p>
          <p>Local reflection features remain available offline. Architect conversations require a separately configured private home gateway and local model; downloading the app does not connect an AI provider.</p>
          <h2>Verify this release</h2>
          <ul>
            <li>Package: org.arcanum.nativehost · version {release.versionCode}.</li>
            <li>APK SHA-256: <code style={{ overflowWrap: "anywhere" }}>{release.sha256}</code></li>
            <li>Publisher SHA-256: <code style={{ overflowWrap: "anywhere" }}>{release.signerSha256}</code></li>
            <li><a href={`https://github.com/The-Architect-369/Arcanum/tree/${release.sourceCommit}`}>Exact build source</a></li>
            <li><a href={release.manifestUrl}>Update manifest</a> · <a href={release.manifestUrl.replace("manifest.json", "SHA256SUMS")}>Checksums</a></li>
          </ul>
          <p>This development release does not activate chain services. Your device verifies package identity and publisher signature before an update.</p>
        </div>
      </section>
    </PublicShell>
  );
}
