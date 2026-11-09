import UpdatesInstall from "./UpdatesInstall";
import release from "../../../public/updates/release.json";
const reviewed =
  release.versionCode === 34 &&
  release.sourceCommit === "75cad68cb3733a44b5b13bcea153f2f77dfa7bda";
const platforms = ["iPhone / iPad", "Windows", "macOS", "Linux"];
export default function UpdatesAvailable() {
  return (
    <section className="updates-available" aria-labelledby="available-heading">
      <div className="updates-view-heading">
        <h2 id="available-heading">Find your starting point.</h2>
        <p>Explore what you can use today.</p>
      </div>
      <details className="available-current">
        <summary>
          <span className="updates-kicker">The current release</span>
          <h3>Start here.</h3>
          <p>
            Arcanum for Android{" "}
            <span className="updates-status-pill">
              Development release · {release.versionCode}
            </span>
          </p>
          <span className="updates-card-action">
            Review requirements and download ↓
          </span>
        </summary>
        <div className="available-expanded">
          <p>{release.versionName}</p>
          <p>
            Android 8 or later, ARM64 or x86_64. This is the approved public
            development release; newer private review builds are separate.
          </p>
          <a className="public-button" href="https://the-arcanum.net/download">
            Review the Android download →
          </a>
          <p>
            Keep your existing app installed when updating. Android asks you to
            confirm installation. A separately configured local model and
            private home gateway are required for Architect conversations.
          </p>
          <details>
            <summary>Verify the release</summary>
            <p>
              APK SHA-256: <code>{release.sha256}</code>
            </p>
            <p>
              Publisher SHA-256: <code>{release.signerSha256}</code>
            </p>
            <p>
              <a href={release.manifestUrl}>Release manifest</a> ·{" "}
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
        </div>
      </details>
      <details className="available-group">
        <summary>
          <span className="updates-kicker">What you can do</span>
          <h3>Explore the possibilities.</h3>
          <p>Available features and the setup they need.</p>
        </summary>
        <div className="available-expanded">
          {reviewed ? (
            <div className="available-capabilities">
              <details>
                <summary>
                  <strong>Keep a local reflection</strong>
                  <span>Available offline</span>
                </summary>
                <p>
                  Local reflection features remain available without a model
                  connection.
                </p>
              </details>
              <details>
                <summary>
                  <strong>Choose an Architect conversation</strong>
                  <span>Separate setup required</span>
                </summary>
                <p>
                  Reviewed requests can use a configured private home gateway
                  and local model. Downloading the app does not supply an AI
                  service.
                </p>
              </details>
              <details>
                <summary>
                  <strong>Choose what enters development memory</strong>
                  <span>A separate reviewed choice</span>
                </summary>
                <p>
                  Retaining an answer in development memory is separate from
                  receiving it. It is not a default export of private
                  reflections.
                </p>
              </details>
              <details>
                <summary>
                  <strong>Understand the boundaries</strong>
                  <span>Chain services are not activated</span>
                </summary>
                <p>
                  This development release does not activate chain services or
                  grant network or economic rights.
                </p>
              </details>
            </div>
          ) : (
            <p>
              A newly reviewed capability summary is needed for this artifact.
              Older release descriptions are not evidence of its behavior.
            </p>
          )}
        </div>
      </details>
      <details className="available-group">
        <summary>
          <span className="updates-kicker">Your device</span>
          <h3>Find what’s available for you.</h3>
          <p>
            Android has a published native release. Other native packages are
            not listed here.
          </p>
        </summary>
        <div className="available-expanded">
          <div className="available-platforms">
            <details>
              <summary>
                <strong>Android</strong>
                <span>Development download available</span>
              </summary>
              <p>
                Android 8 or later, ARM64 or x86_64.{" "}
                <a href="https://the-arcanum.net/download">
                  Review the approved release
                </a>
                .
              </p>
            </details>
            {platforms.map((name) => (
              <details key={name}>
                <summary>
                  <strong>{name}</strong>
                  <span>No download available</span>
                </summary>
                <p>
                  No native Arcanum package for {name} is published through this
                  release channel. A development or delivery commitment is not
                  established by this listing.
                </p>
                <p>
                  You can read this Updates site in a compatible browser.
                  Browser access is distinct from a native Arcanum package.
                </p>
              </details>
            ))}
          </div>
          <details className="available-web">
            <summary>
              <strong>This window, in your browser</strong>
              <span>The Updates web app is separate from native Arcanum</span>
            </summary>
            <p>
              Read the development record without installing the native app.
              Where supported, installing this Updates PWA provides convenient
              access; it does not enable alerts.
            </p>
            <UpdatesInstall />
            <p>
              Preview installations use a different origin from the final public
              site. Browser and installation behavior is not certified on every
              platform.
            </p>
          </details>
        </div>
      </details>
      <p className="updates-footnote">
        Native availability is based on the approved release listing. Public
        reading needs neither an account nor the native app; this review preview
        retains its hosting access protection.
      </p>
    </section>
  );
}
