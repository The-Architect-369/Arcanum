import Link from "next/link";
import { repository, pillars, source, siteLog } from "@/lib/public-site";
import PublicNav from "./PublicNav";
import "@/app/(marketing)/public-home.css";
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-home">
      <a className="public-skip" href="#public-main">
        Skip to content
      </a>
      <PublicNav />
      <main id="public-main" tabIndex={-1}>
        {children}
      </main>
      <footer className="public-footer">
        <div className="public-shell public-footer-grid">
          <div>
            <a href="https://the-arcanum.net/" className="public-wordmark">
              ARCANUM
            </a>
            <p>
              A Human Journey.
              <br />A network taking shape.
            </p>
            <span className="public-eyebrow">Pre-Genesis · Public website</span>
          </div>
          <div>
            <p className="public-label">Explore the system</p>
            {pillars.map((p) => (
              <Link href={`/explore/${p.slug}`} key={p.slug}>
                {p.name}
              </Link>
            ))}
          </div>
          <div>
            <p className="public-label">Follow the work</p>
            <Link href="/principles">Principles &amp; source documents</Link>
            <Link href="/updates">Public journal</Link>
            <a href="/site-log.json">Machine-readable site log ↗</a>
            <a href={repository}>Repository ↗</a>
            <Link href="/download">Android release status</Link>
            <a href="https://updates.the-arcanum.net/">Updates channel ↗</a>
            <a href="https://journeys.the-arcanum.net/">The Great Journey ↗</a>
            <a href="https://architect.the-arcanum.net/">
              Development dashboard ↗
            </a>
          </div>
        </div>
        <div className="public-shell public-footer-bottom">
          <span>Meaning remains yours.</span>
          <span>
            Website v{siteLog.siteVersion} ·{" "}
            <time dateTime={siteLog.recordedOn}>{siteLog.recordedOn}</time>
          </span>
        </div>
      </footer>
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="public-shell public-page-intro">
      <p className="public-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="public-intro">{children}</div>
    </div>
  );
}
export function PillarCards() {
  return (
    <div className="public-pillar-grid">
      {pillars.map((p) => (
        <Link
          className={`public-pillar-card pillar-${p.slug}`}
          href={`/explore/${p.slug}`}
          key={p.slug}
        >
          <span className="public-card-number">
            {p.number}
            <span aria-hidden="true">↗</span>
          </span>
          <p className="public-label">{p.theme}</p>
          <h3>{p.name}</h3>
          <p>{p.summary}</p>
          <span className="public-card-link">
            Explore {p.name} <span aria-hidden="true">→</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
export function SourceList({
  sources,
}: {
  sources: readonly { label: string; path: string }[];
}) {
  return (
    <aside className="public-sources">
      <p className="public-eyebrow">Read the source</p>
      <p>
        These summaries are grounded in the repository. Each document retains
        its own status and authority.
      </p>
      <ul>
        {sources.map((s) => (
          <li key={s.path}>
            <a href={source(s.path)}>{s.label} ↗</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
export function TempusFigure() {
  return (
    <figure className="public-tempus-figure">
      <svg
        viewBox="0 0 500 500"
        role="img"
        aria-label="Conceptual TEMPUS illustration: concentric cycles around a chosen moment, with time, place, and meaning as distinct contexts."
      >
        <defs>
          <radialGradient id="tempus-glow">
            <stop stopColor="#e0bf83" stopOpacity=".22" />
            <stop offset="1" stopColor="#e0bf83" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="250" cy="250" r="246" fill="url(#tempus-glow)" />
        <g fill="none" stroke="#d6bd8c">
          <circle cx="250" cy="250" r="205" opacity=".25" />
          <circle
            cx="250"
            cy="250"
            r="164"
            opacity=".4"
            strokeDasharray="1 12"
            strokeWidth="3"
          />
          <circle cx="250" cy="250" r="123" opacity=".55" />
          <circle cx="250" cy="250" r="78" opacity=".28" />
          <path d="M250 25v48M250 427v48M25 250h48M427 250h48" opacity=".6" />
          <ellipse
            cx="250"
            cy="250"
            rx="205"
            ry="78"
            transform="rotate(-35 250 250)"
            opacity=".3"
          />
        </g>
        <circle cx="250" cy="45" r="5" fill="#d6bd8c" />
        <circle cx="373" cy="250" r="5" fill="#8fd7cc" />
        <circle cx="250" cy="250" r="7" fill="#e8d1a2" />
        <g
          fill="#ede6db"
          textAnchor="middle"
          fontFamily="sans-serif"
          fontSize="11"
          letterSpacing="4"
        >
          <text x="250" y="114">
            TIME
          </text>
          <text x="250" y="333">
            PLACE
          </text>
          <text x="250" y="410">
            MEANING
          </text>
        </g>
        <text
          x="250"
          y="232"
          fill="#e8d1a2"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="27"
        >
          A moment, yours.
        </text>
      </svg>
      <figcaption>
        Concept illustration · no live astronomical readings
      </figcaption>
    </figure>
  );
}
