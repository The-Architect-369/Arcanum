import Image from "next/image";
import "./public-home.css";

const repository = "https://github.com/The-Architect-369/Arcanum";

export default function HomePage() {
  return (
    <div className="public-home">
      <a className="public-skip" href="#public-main">Skip to content</a>
      <header className="public-header">
        <div className="public-shell public-nav">
          <a className="public-brand" href="/" aria-label="Arcanum home">
            <Image src="/logo-arcanum.svg" alt="" width={38} height={38} priority />
            <span>ARCANUM</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#download">Download</a>
            <a href="#verify">Updates &amp; verification</a>
            <a href="#project">The project</a>
            <a href="#resources">Documents</a>
            <a href={repository} rel="noopener noreferrer">GitHub ↗</a>
          </nav>
        </div>
      </header>
      <main id="public-main">
        <div className="public-shell public-hero">
          <div className="public-hero-copy">
            <p className="public-eyebrow">ARCnet / Pre-Genesis</p>
            <h1>A network taking shape.<br /><em>An open path inside.</em></h1>
            <p className="public-intro">Arcanum is the developing application ecosystem for ARCnet, a network designed around human agency, learning, reflection, and meaningful action. Explore its public work and follow each release as it becomes ready to use.</p>
            <a className="public-text-link" href="#project">Explore the project ↗</a>
          </div>
          <section className="public-release-card" id="download" aria-labelledby="release-title">
            <div className="public-card-top"><span className="public-label">ANDROID NATIVE HOST</span><span className="public-status">Release pending</span></div>
            <div className="public-card-body">
              <p className="public-card-kicker">The next verified build</p>
              <h2 id="release-title">Download Arcanum</h2>
              <p>No public APK has been approved and verified for distribution yet. When one is ready, this page will provide the signed APK, its exact version, SHA-256 checksum, signer fingerprint, and source revision together.</p>
            </div>
            <div className="public-card-action"><span className="public-unavailable" aria-label="Download unavailable">Download not yet available</span><a href={repository} rel="noopener noreferrer">Inspect the source ↗</a></div>
            <div className="public-card-foot">No placeholder installer. No unverified “latest” link.</div>
          </section>
        </div>
        <div className="public-shell public-below">
          <section id="project" className="public-story" aria-labelledby="project-title">
            <p className="public-eyebrow">01 / THE PROJECT</p>
            <h2 id="project-title">Built for the human journey.</h2>
            <p>Arcanum is the application experience; ARCnet is its developing network infrastructure. The project explores Hope for reflection, Tempus for time, and Vitae for learning. The source and documents describe both implemented work and proposals, each under its recorded status.</p>
            <a className="public-text-link" href={repository} rel="noopener noreferrer">Read the repository ↗</a>
          </section>
          <section id="verify" className="public-story" aria-labelledby="verify-title">
            <p className="public-eyebrow">02 / UPDATES &amp; RELEASE INTEGRITY</p>
            <h2 id="verify-title">A release you can inspect.</h2>
            <p>The machine-readable update route and the public download package are the next release priorities. The proposed channel at <code>updates.the-arcanum.net</code> remains separate from this human-facing page and is not live. Before a download appears here, the exact signed APK and immutable manifest must agree on version, artifact digest, signer, source revision, and provenance; both must be reachable directly without sign-in or redirects.</p>
            <a className="public-text-link" href="#download">See download status ↑</a>
          </section>
          <section id="resources" className="public-story" aria-labelledby="resources-title">
            <p className="public-eyebrow">03 / PUBLIC DOCUMENTS</p>
            <h2 id="resources-title">Follow the recorded work.</h2>
            <p>The public repository is the source for these documents. Edits become visible on GitHub through its review and merge process; this page links to their current versions and does not reproduce them automatically.</p>
            <ul className="public-resource-list">
              <li><a href={`${repository}/blob/main/docs/index.md`} rel="noopener noreferrer">Documentation index ↗</a></li>
              <li><a href={`${repository}/blob/main/docs/roadmap/canonical-roadmap.md`} rel="noopener noreferrer">Roadmap ↗</a></li>
              <li><a href={`${repository}/blob/main/docs/whitepaper/executive-summary.md`} rel="noopener noreferrer">Executive summary <span>Draft</span> ↗</a></li>
              <li><a href={`${repository}/blob/main/docs/changelog.md`} rel="noopener noreferrer">Changelog <span>Draft</span> ↗</a></li>
            </ul>
          </section>
        </div>
      </main>
      <footer className="public-footer"><div className="public-shell public-footer-inner"><span>© Arcanum · An open work in progress</span><a href={repository} rel="noopener noreferrer">Source on GitHub ↗</a></div></footer>
    </div>
  );
}
