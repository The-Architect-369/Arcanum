import CurrentPlatformChooser from "./CurrentPlatformChooser";
import UpdatesInstall from "./UpdatesInstall";
import release from "../../../public/updates/release.json";
import manifest from "../../../public/updates/a18/manifest.json";

const matched =
  release.versionCode === manifest.package.versionCode &&
  release.versionName === manifest.package.versionName &&
  release.sha256 === manifest.artifact.sha256 &&
  release.sourceCommit === manifest.build.sourceCommit &&
  release.signerSha256 === manifest.artifact.publisherSignerSha256;

export default function UpdatesAvailable() {
  return (
    <section
      className="current-download-card"
      aria-labelledby="available-heading"
    >
      <h1 className="sr-only" id="available-heading">
        Available
      </h1>
      <CurrentPlatformChooser
        buildName={matched ? `Android build ${release.versionCode}` : undefined}
        web={<UpdatesInstall />}
        android={
          matched && (
            <>
              <p>Public Android development release · {release.versionName}</p>
              <p>
                <strong>Requirements</strong>
                <br />
                {manifest.compatibility.minSdk === 26
                  ? "Android 8.0 or later"
                  : `Android API ${manifest.compatibility.minSdk} or later`}{" "}
                · {manifest.compatibility.abis.join(" or ")}
              </p>
              <p>
                Keep local reflections offline. Architect conversations require
                a separately configured home gateway and local model.
              </p>
              <a className="download-primary" href={release.apkUrl}>
                Download Android APK ·{" "}
                {(manifest.artifact.sizeBytes / 1_000_000).toFixed(1)} MB
              </a>
              <details className="download-provenance">
                <summary>Source and verification</summary>
                <p>
                  Source <code>{release.sourceCommit}</code>
                </p>
                <p>
                  APK SHA-256 <code>{release.sha256}</code>
                </p>
                <p>
                  Publisher SHA-256 <code>{release.signerSha256}</code>
                </p>
                <a href={release.manifestUrl}>Release manifest</a>
              </details>
            </>
          )
        }
      />
    </section>
  );
}
