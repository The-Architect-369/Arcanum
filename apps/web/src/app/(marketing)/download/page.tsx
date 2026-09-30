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
      <PageIntro eyebrow="Get Arcanum / Android" title="Take the next step.">
        <p>
          Android is the first native host for Arcanum. The verified A14.2
          development candidate is available for download and inspection.
        </p>
      </PageIntro>
      <section className="public-shell public-release-layout">
        <div className="public-release-card">
          <span className="public-status">Verified development candidate</span>
          <h2>Download Arcanum</h2>
          <p>
            A14.2 · version 0.1.14-cew04-a14-2 (19). Android 8 or later, ARM64
            or x86_64. This development candidate has passed distribution
            inspection; production release and chain integration remain gated.
          </p>
          <a
            className="public-button"
            href="https://updates.the-arcanum.net/updates/a14-2/arcanum-ce-w04-a14-2-d2e30b2.apk"
          >
            Download Android APK
          </a>
          <p className="public-caption">
            Installation requires your Android confirmation.
          </p>
        </div>
        <div className="public-prose">
          <h2>Verify this download</h2>
          <ul>
            <li>Package: org.arcanum.nativehost · version 19.</li>
            <li>
              APK SHA-256:{" "}
              <code style={{ overflowWrap: "anywhere" }}>
                33b42f0449dd04c0f76424ca9c79590366c95e0e84ee4c44b528c6d5b472be96
              </code>
            </li>
            <li>
              Signer SHA-256:{" "}
              <code style={{ overflowWrap: "anywhere" }}>
                9841fbeda4d7d0c63b1663360fb0415218a08f063b5629317274076dfbb6b844
              </code>
            </li>
            <li>
              <a href="https://github.com/The-Architect-369/Arcanum/actions/runs/36700153842">
                Signed build and source provenance
              </a>{" "}
              · source d2e30b275234.
            </li>
            <li>
              <a href="https://updates.the-arcanum.net/updates/a14-2/manifest.json">
                Update manifest
              </a>{" "}
              and{" "}
              <a href="https://updates.the-arcanum.net/updates/a14-2/SHA256SUMS">
                checksums
              </a>
              .
            </li>
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
            The update channel at <code>updates.the-arcanum.net</code> serves
            the inspected APK and update manifest directly over HTTPS. A15
            installation and recovery evidence and chain-live compatibility
            remain separate gates. The public site log records editorial changes
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
