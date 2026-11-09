import CurrentCards from "./CurrentCards";
import UpdatesInstall from "./UpdatesInstall";
import release from "../../../public/updates/release.json";
const reviewed =
  release.versionCode === 34 &&
  release.sourceCommit === "75cad68cb3733a44b5b13bcea153f2f77dfa7bda";
export default function UpdatesAvailable() {
  return (
    <section aria-labelledby="available-heading">
      <div className="updates-view-heading">
        <h1 id="available-heading">Find your starting point.</h1>
        <p>Explore what you can use today.</p>
      </div>
      <CurrentCards
        label="Explore Arcanum"
        entries={[
          {
            id: "arcanum",
            title: "Arcanum",
            summary: "Explore Arcanum on your device.",
            status: "Android development release available",
            action: "Check availability",
            logo: true,
            content: (
              <>
                <p className="updates-panel-lead">
                  Choose your device to see what’s available.
                </p>
                <div className="current-platforms">
                  {[
                    "Android",
                    "iPhone / iPad",
                    "Windows",
                    "macOS",
                    "Linux",
                  ].map((name) => (
                    <details key={name} className="current-project">
                      <summary>
                        <strong>{name}</strong>
                        <span className="updates-status-pill">
                          {name === "Android"
                            ? "Development download available"
                            : "No download available"}
                        </span>
                      </summary>
                      {name === "Android" ? (
                        <>
                          <p>
                            Android 8 or later, ARM64 or x86_64. This is
                            guidance; meeting these requirements does not
                            guarantee installation succeeds.
                          </p>
                          <p>
                            Approved public development release{" "}
                            {release.versionCode} · {release.versionName}.
                            Integrated source and private review builds are
                            separate.
                          </p>
                          <details className="current-project">
                            <summary>Explore what’s included</summary>
                            {reviewed ? (
                              <>
                                <p>
                                  Keep local reflections offline. Architect
                                  conversations require a separately configured
                                  private home gateway and local model; the
                                  download does not supply an AI service.
                                </p>
                                <p>
                                  Retaining a conversation in development memory
                                  is a separate reviewed choice. Chain services
                                  are not activated by this release.
                                </p>
                              </>
                            ) : (
                              <p>
                                A newly reviewed capability summary is needed
                                for this artifact.
                              </p>
                            )}
                          </details>
                          <details className="current-project">
                            <summary>
                              Requirements, first use and source
                            </summary>
                            <p>
                              Keep your existing app installed when updating.
                              Android asks you to confirm installation. Local
                              reflection features do not require a model
                              connection; Architect conversations need the
                              separate setup above.
                            </p>
                            <p>
                              Source: <code>{release.sourceCommit}</code>
                            </p>
                            <p>
                              APK SHA-256: <code>{release.sha256}</code>
                            </p>
                            <p>
                              Publisher SHA-256:{" "}
                              <code>{release.signerSha256}</code>
                            </p>
                            <p>
                              <a href={release.manifestUrl}>Release manifest</a>{" "}
                              ·{" "}
                              <a
                                href={release.manifestUrl.replace(
                                  "manifest.json",
                                  "SHA256SUMS",
                                )}
                              >
                                Checksums
                              </a>
                            </p>
                          </details>
                          <a
                            className="current-action"
                            href="https://the-arcanum.net/download"
                          >
                            Review the Android download →
                          </a>
                        </>
                      ) : (
                        <>
                          <p>There isn’t a release for this platform yet.</p>
                          <p>
                            This listing does not establish an active
                            development or delivery commitment for {name}. You
                            can read Arcanum Current in a compatible browser.
                          </p>
                          <a
                            className="current-action"
                            href="/updates?view=next"
                          >
                            Follow development →
                          </a>
                          <p>
                            No platform-specific published work is listed yet;
                            explore the wider project directions.
                          </p>
                        </>
                      )}
                    </details>
                  ))}
                </div>
                <details className="current-project">
                  <summary>Arcanum Current in your browser</summary>
                  <p>
                    Follow development without installing native Arcanum. This
                    PWA is a separate experience and does not enable alerts.
                  </p>
                  <UpdatesInstall />
                  <p>
                    Preview installations remain on the preview origin. Existing
                    installed names may refresh later at the browser’s
                    discretion; a reinstall may be needed. The public origin
                    remains separate.
                  </p>
                </details>
              </>
            ),
          },
        ]}
      />
      <p className="updates-footnote">
        Public reading needs neither an account nor native Arcanum. This review
        preview retains its hosting access protection.
      </p>
    </section>
  );
}
