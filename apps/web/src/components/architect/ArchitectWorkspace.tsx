"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Clock3,
  FolderKanban,
  Layers3,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import CurrentPanel from "@/components/public/CurrentPanel";
import CurrentTopicVisual from "@/components/public/CurrentTopicVisual";
import {
  projects,
  type ArchitectReadModel,
  type ArchitectEvent,
} from "@/lib/architect/model";
const tabs = [
  { id: "now", label: "Now", icon: Layers3 },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "timeline", label: "Timeline", icon: Clock3 },
] as const;
type Tab = (typeof tabs)[number]["id"];
const labels = {
  web: "Web applications",
  native: "Native application",
  technology: "Technology & infrastructure",
};
const status = (text: string) => text.replaceAll("_", " ");
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value)) + " ET"
    : "Event date not recorded";
export default function ArchitectWorkspace({
  initial,
  demo = false,
  accountControl,
}: {
  initial: ArchitectReadModel;
  demo?: boolean;
  accountControl: React.ReactNode;
}) {
  const [data, setData] = useState<ArchitectReadModel | null>(initial),
    [tab, setTab] = useState<Tab>("now"),
    [selected, setSelected] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const tray = useRef<HTMLElement>(null);
  const main = useRef<HTMLElement>(null),
    positions = useRef<Record<Tab, number>>({
      now: 0,
      projects: 0,
      timeline: 0,
    }),
    active = useRef(tab),
    sequence = useRef(0);
  const refresh = useCallback(async () => {
    if (demo) return;
    const request = ++sequence.current;
    setBusy(true);
    try {
      const response = await fetch("/api/architect/records", {
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
      });
      if (request !== sequence.current) return;
      if (!response.ok) {
        setData(null);
        setSelected(null);
        setMessage(
          response.status === 401 || response.status === 403
            ? "Access is no longer authorized. Sign in again."
            : "Authorization or stored snapshot is unreachable. Reconnect to check access.",
        );
        return;
      }
      const next = await response.json();
      if (request !== sequence.current) return;
      setData(next);
      if (document.visibilityState === "visible")
        delete document.documentElement.dataset.architectLocked;
      setMessage("");
    } catch {
      if (request !== sequence.current) return;
      setData(null);
      setSelected(null);
      setMessage(
        "Connection unavailable. Reconnect to verify access before viewing records.",
      );
    } finally {
      if (request === sequence.current) setBusy(false);
    }
  }, [demo]);
  useEffect(() => {
    if (demo) return;
    const lock = () => {
      sequence.current++;
      document.documentElement.dataset.architectLocked = "true";
    };
    const shown = (event: PageTransitionEvent) => {
      if (event.persisted) {
        lock();
        void refresh();
      }
    };
    const visible = () => {
      if (document.visibilityState === "hidden") lock();
      else {
        lock();
        void refresh();
      }
    };
    window.addEventListener("pagehide", lock);
    window.addEventListener("pageshow", shown);
    document.addEventListener("visibilitychange", visible);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 60000);
    return () => {
      lock();
      clearInterval(timer);
      window.removeEventListener("pagehide", lock);
      window.removeEventListener("pageshow", shown);
      document.removeEventListener("visibilitychange", visible);
      delete document.documentElement.dataset.architectLocked;
    };
  }, [demo, refresh]);
  useEffect(() => {
    const element = tray.current;
    if (!element) return;
    const frame = element.closest<HTMLElement>(".updates-app");
    const measure = () =>
      frame?.style.setProperty(
        "--updates-tray-height",
        `${element.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    main.current?.scrollTo({
      top: positions.current[tab],
      behavior: "instant",
    });
  }, [tab]);
  const navigate = (next: Tab) => {
    if (selected) return;
    positions.current[active.current] = main.current?.scrollTop ?? 0;
    active.current = next;
    setTab(next);
  };
  const all = data ? projects(data) : [];
  const project = all.find((p) => p.id === selected);
  const unavailable = data?.sources.some((s) => s.state === "unreachable");
  const stale = all.some(
    (p) => Date.now() - Date.parse(p.latest.observedAt) > 86400000,
  );
  const renderCard = (p: (typeof all)[number]) => (
    <button
      className="current-card"
      key={p.id}
      type="button"
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        setSelected(p.id);
      }}
    >
      <CurrentTopicVisual
        topic={
          p.domain === "web"
            ? "website"
            : p.domain === "native"
              ? "arcanum"
              : "arcnet"
        }
      />
      <span className="current-card-heading">
        {p.title}
        <ArrowUpRight size={20} aria-hidden="true" />
      </span>
      <span className="updates-card-meaning">{p.latest.summary}</span>
      <span className="updates-status-pill">{status(p.latest.status)}</span>
      <span className="architect-card-meta">
        {p.current
          ? `Accepted milestone: ${p.current.milestoneTitle}`
          : "No accepted milestone recorded"}
      </span>
      <span className="updates-card-action">
        {tab === "timeline" ? "Explore milestones & snapshots" : "Open project"}{" "}
        →
      </span>
    </button>
  );
  return (
    <div className="public-home updates-app architect-app">
      <a className="public-skip" href="#architect-main">
        Skip to workspace
      </a>
      <header className="current-header architect-header">
        <a
          className="current-lockup"
          href="/architect/review"
          onClick={(event) => {
            event.preventDefault();
            if (!selected) {
              navigate("now");
              main.current?.scrollTo({ top: 0 });
            }
          }}
        >
          <img src="/logo-arcanum.svg" width="36" height="36" alt="" />
          <span>
            <strong>Architect</strong>
            <small>Read-only workspace</small>
          </span>
        </a>
        <div className="current-section-title">
          <h1>
            {tab === "now"
              ? "Where the work stands."
              : tab === "projects"
                ? "Explore the connected projects."
                : "Milestones, with their history."}
          </h1>
          <p>Shared overviews · explicit evidence · separate authority</p>
        </div>
        <div className="architect-account">
          {accountControl}
          <a href="https://updates.the-arcanum.net/">Public Current ↗</a>
        </div>
      </header>
      <main
        id="architect-main"
        ref={main}
        tabIndex={-1}
        className="architect-reading"
      >
        <div className="updates-hub">
          <div className="architect-freshness">
            {demo ? (
              <p className="architect-notice">
                <strong>Synthetic visual preview.</strong> These are example
                records, not the internal corpus. Google login and data
                transport are not activated by this preview.
              </p>
            ) : (
              <>
                <p>Last ingestion attempt: {date(data?.updatedAt ?? null)}</p>
                <p>
                  Checks stored snapshots every minute while visible. Source
                  ingestion is operator-run until an approved event transport is
                  connected.
                </p>
                <button
                  type="button"
                  className="current-action"
                  disabled={busy}
                  onClick={() => void refresh()}
                >
                  <RefreshCw size={16} aria-hidden="true" />{" "}
                  {busy ? "Checking access & records…" : "Refresh stored view"}
                </button>
              </>
            )}
            {message && (
              <div role="status">
                <p>{message}</p>
                <a href="/architect/login">Architect sign-in →</a>
              </div>
            )}
          </div>
          <div className="architect-protected">
            {data && (
              <>
                {(unavailable || stale) && !demo && (
                  <p className="architect-notice">
                    {unavailable
                      ? "A selected source is unreachable; previous stored evidence is retained."
                      : "Some source observations are over 24 hours old."}{" "}
                    Observation times and ingestion times are separate; this is
                    not a live workstation connection.
                  </p>
                )}
                {data.conflicts.length > 0 && (
                  <p className="architect-notice">
                    Conflicting events were retained for review. Previous
                    snapshots were not overwritten.
                  </p>
                )}
                {tab === "now" && (
                  <section aria-label="Now summary">
                    <p className="architect-intro">
                      Selected whole-program positions. Coverage depends on the
                      reconciled sources shown here; no wave closure is
                      inferred.
                    </p>
                    <div className="updates-list">{all.map(renderCard)}</div>
                  </section>
                )}
                {tab === "projects" && (
                  <section aria-label="Project domains">
                    {Object.entries(labels).map(([domain, title]) => (
                      <section key={domain} className="architect-domain">
                        <h2>{title}</h2>
                        <div className="updates-list">
                          {all
                            .filter((p) => p.domain === domain)
                            .map(renderCard)}
                        </div>
                        {!all.some((p) => p.domain === domain) && (
                          <p>No selected project records yet.</p>
                        )}
                      </section>
                    ))}
                  </section>
                )}
                {tab === "timeline" && (
                  <section aria-label="Milestone timeline">
                    <p className="architect-intro">
                      Domain → project → milestone → dated snapshots. Previous
                      accepted milestones remain available.
                    </p>
                    <div className="updates-list">{all.map(renderCard)}</div>
                  </section>
                )}
                {!all.length && (
                  <p>No selected project records have been ingested yet.</p>
                )}
                <p className="updates-footnote">
                  Viewing confers no editing, terminal, execution, deployment,
                  financial or governance rights.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <nav
        ref={tray}
        className="updates-nav architect-tray"
        aria-label="Architect workspace"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={id === tab ? "page" : undefined}
            onClick={() => navigate(id)}
          >
            <Icon size={22} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {project && data && (
        <CurrentPanel
          title={project.title}
          label={labels[project.domain]}
          onClose={() => setSelected(null)}
        >
          <div className="architect-protected">
            <p className="updates-panel-lead">{project.latest.summary}</p>
            <p>
              {project.current
                ? `Current accepted milestone: ${project.current.milestoneTitle}`
                : "No accepted milestone is established by these selected records."}
            </p>
            {project.milestones.map((m) => (
              <details
                key={m.id}
                className="current-project"
                open={m.id === project.current?.milestoneId}
              >
                <summary>
                  {m.events.at(-1)?.milestoneTitle} · {m.events.length}{" "}
                  {m.events.length === 1 ? "snapshot" : "snapshots"}
                </summary>
                {[...m.events].reverse().map((event) => (
                  <Snapshot key={event.id} event={event} />
                ))}
              </details>
            ))}
            <details className="current-project">
              <summary>Account & passkey status</summary>
              <p>
                Google sign-in and record enrollment are separate checks.
                Portal-enrolled passkeys are not enabled in this first build.
                Google may offer its own account passkey; your device chooses
                fingerprint, face or PIN.
              </p>
              <p>
                No biometric template is stored by this portal. Lost-device
                recovery is not a no-auth bypass.
              </p>
            </details>
          </div>
        </CurrentPanel>
      )}
    </div>
  );
}
function Snapshot({ event }: { event: ArchitectEvent }) {
  return (
    <details className="architect-snapshot">
      <summary>
        {event.title}
        <span className="updates-status-pill">{status(event.status)}</span>
      </summary>
      <p>{event.summary}</p>
      <p>
        <strong>Scope:</strong> {event.scope}
      </p>
      <p>
        <strong>Next gate:</strong> {event.nextGate}
      </p>
      <dl>
        <dt>Event time</dt>
        <dd>{date(event.eventAt)}</dd>
        <dt>Source observed</dt>
        <dd>{date(event.observedAt)}</dd>
        <dt>Last ingested</dt>
        <dd>{date(event.ingestedAt)}</dd>
        <dt>Stable identity</dt>
        <dd>{event.id}</dd>
        <dt>Source</dt>
        <dd>{event.sourceRef}</dd>
        <dt>Source digest</dt>
        <dd>
          <code>{event.sourceDigest}</code>
        </dd>
      </dl>
      {(event.era || event.wave || event.arc) && (
        <p>{[event.era, event.wave, event.arc].filter(Boolean).join(" · ")}</p>
      )}
      {event.resources.map((resource) => (
        <p key={resource.url}>
          <a href={resource.url}>{resource.title} ↗</a>
          <br />
          {resource.label}
        </p>
      ))}
    </details>
  );
}
