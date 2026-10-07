import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  PublicShell,
  PillarCards,
  TempusFigure,
} from "@/components/public/PublicShell";
export const metadata: Metadata = {
  title: "Arcanum — A Human Journey",
  alternates: { canonical: "/" },
};
export default function HomePage() {
  return (
    <PublicShell>
      <section
        className="public-shell public-hero"
        aria-labelledby="home-title"
      >
        <div className="public-hero-copy">
          <p className="public-eyebrow">
            <span className="public-dot" /> Arcanum / Pre-Genesis
          </p>
          <h1 id="home-title">
            Look up.
            <br />
            <em>A Human Journey.</em>
          </h1>
          <p className="public-intro">
            The universe is vast, and your life is happening inside it. Follow
            the sky. Take a different route. Test what you think you know.
            Arcanum is being built for discovery, reflection, and practice. It
            opens a door. You decide whether to walk through.
          </p>
          <div className="public-actions">
            <Link className="public-button" href="/about">
              Explore the journey <span aria-hidden="true">↗</span>
            </Link>
            <Link className="public-text-link" href="/explore">
              Explore the pillars →
            </Link>
          </div>
          <p className="public-hero-note">
            Notice the world. Find your own words.
            <br />
            An application taking shape, with ARCnet beneath it.
          </p>
        </div>
        <figure className="public-artwork">
          <div className="public-artwork-frame">
            <Image
              src="/art/hope-architect-v2.png"
              alt="Architect and brunette Hope beside a geometric map, with an imagined blue-and-gold landscape and Earth beyond."
              width={1672}
              height={941}
              sizes="(max-width: 800px) calc(100vw - 36px), (max-width: 1264px) calc(100vw - 64px), 1200px"
              priority
            />
          </div>
          <figcaption>Hope &amp; Architect · Concept illustration</figcaption>
        </figure>
      </section>
      <div className="public-foundation-strip">
        <div className="public-shell">
          <span>Human sovereignty</span>
          <span>Participation by choice</span>
          <span>Meaning without measurement</span>
        </div>
      </div>
      <section
        className="public-shell public-section"
        aria-labelledby="pillars-title"
      >
        <div className="public-section-heading">
          <div>
            <p className="public-eyebrow">01 / The structure</p>
            <h2 id="pillars-title">
              Distinct roles.
              <br />
              <em>One human journey.</em>
            </h2>
          </div>
          <p>
            Five ways into the project. Each has a purpose, and each has limits
            that protect the person at the center. These are introductions to
            the system’s design as it develops.
          </p>
        </div>
        <PillarCards home />
      </section>
      <section className="public-tempus-feature" aria-labelledby="tempus-title">
        <div className="public-shell public-feature-grid">
          <div>
            <p className="public-eyebrow">02 / TEMPUS</p>
            <h2 id="tempus-title">
              Give your moments
              <br />
              <em>room to mean.</em>
            </h2>
            <p className="public-intro">
              The world moves in cycles. Your life moves at its own pace. TEMPUS
              brings time, place, and chosen practice into view—without turning
              them into a demand.
            </p>
            <Link className="public-text-link" href="/explore/tempus">
              Step inside TEMPUS →
            </Link>
          </div>
          <div className="public-context-list">
            <TempusFigure />
            <article>
              <span>01</span>
              <div>
                <h3>Time</h3>
                <p>Cycles, seasons, and moments of return.</p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Place</h3>
                <p>The context and point of view of an observation.</p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Meaning</h3>
                <p>The interpretation you choose to bring.</p>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section
        className="public-shell public-section public-two-col"
        aria-labelledby="network-title"
      >
        <div>
          <p className="public-eyebrow">03 / Beyond the application</p>
          <h2 id="network-title">
            Arcanum is the experience.
            <br />
            <em>ARCnet is the foundation.</em>
          </h2>
        </div>
        <div>
          <p className="public-intro">
            Reflection and learning belong to lived experience. Identity
            continuity, factual receipts, and governed exchange need another
            kind of infrastructure. ARCnet is being developed to hold that
            distinction.
          </p>
          <Link className="public-text-link" href="/explore/arcnet">
            Understand the network →
          </Link>
        </div>
      </section>
      <section
        className="public-shell public-download-banner"
        aria-labelledby="download-title"
      >
        <div>
          <p className="public-eyebrow">The next chapter / Android</p>
          <h2 id="download-title">Take the next step.</h2>
          <p>
            The verified Android development candidate is ready to inspect. See
            its version, signing identity, and download details before choosing
            whether to install.
          </p>
        </div>
        <Link className="public-button public-button-outline" href="/download">
          Get Arcanum <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </PublicShell>
  );
}
