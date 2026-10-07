"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { carouselSwipe, cycleIndex } from "@/lib/ui/carousel";

type Pillar = {
  slug: string;
  name: string;
  number: string;
  theme: string;
  summary: string;
  title: string;
  intro: string;
  status: string;
};
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Adapted from BentoShowcase's cyclic selection and the app's vertical-first
// swipe convention. Static server markup remains an ordinary linked list.
export default function PillarCarousel({
  items,
  home = false,
}: {
  items: readonly Pillar[];
  home?: boolean;
}) {
  const enhanced = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  const [turn, setTurn] = useState(0);
  const active = cycleIndex(turn, 0, items.length);
  const [detail, setDetail] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const id = useId();
  const orbit = enhanced;
  const select = (direction: number) => setTurn((value) => value + direction);
  const choose = (index: number) => {
    setTurn((value) => {
      const current = cycleIndex(value, 0, items.length);
      let distance = index - current;
      if (distance > items.length / 2) distance -= items.length;
      if (distance < -items.length / 2) distance += items.length;
      return value + distance;
    });
  };
  useEffect(() => {
    if (home) return;
    const openLinkedPillar = () => {
      const index = items.findIndex(
        (pillar) => window.location.hash === `#pillar-${pillar.slug}`,
      );
      if (index < 0) return;
      setTurn(index);
      setDetail(index);
      root.current?.scrollIntoView({ block: "start", behavior: "instant" });
    };
    openLinkedPillar();
    window.addEventListener("hashchange", openLinkedPillar);
    return () => window.removeEventListener("hashchange", openLinkedPillar);
  }, [home, items]);
  useEffect(() => {
    if (detail === null) return;
    const element = dialog.current;
    const previous = document.body.style.overflow;
    root.current
      ?.querySelector<HTMLElement>(".public-pillar-card.is-selected")
      ?.focus({ preventScroll: true });
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previous;
    };
  }, [detail]);
  return (
    <div
      ref={root}
      className={`pillar-carousel ${orbit ? "is-orbit" : "is-list"}`}
      role="region"
      aria-label="Explore the five pillars"
      aria-roledescription={orbit ? "carousel" : undefined}
    >
      {enhanced && (
        <div className="pillar-carousel-toolbar">
          <p className="public-eyebrow">Five paths / One constellation</p>
        </div>
      )}
      <div className="pillar-stage-shell">
        <div
          id={id}
          className={orbit ? "pillar-orbit-stage" : "public-pillar-grid"}
          onPointerDown={(event) => {
            dragged.current = false;
            if (orbit && event.pointerType !== "mouse")
              start.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerCancel={() => {
            start.current = null;
          }}
          onPointerUp={(event) => {
            if (!start.current) return;
            const direction = carouselSwipe(
              event.clientX - start.current.x,
              event.clientY - start.current.y,
            );
            start.current = null;
            if (direction) {
              dragged.current = true;
              select(direction);
            }
          }}
          onClickCapture={(event) => {
            if (dragged.current) {
              event.preventDefault();
              event.stopPropagation();
              dragged.current = false;
            }
          }}
        >
          {orbit && (
            <div className="pillar-orbit-center" aria-hidden="true">
              <svg viewBox="0 0 240 240" fill="none" stroke="currentColor">
                <circle cx="120" cy="120" r="104" opacity=".35" />
                <circle cx="120" cy="120" r="92" strokeDasharray="1 7" />
                {/* seed-7: unit circles at the origin and six Flower-lattice neighbors. */}
                <g strokeWidth=".8">
                  {[
                    [0, 0],
                    [1, 0],
                    [-1, 0],
                    [0.5, 0.8660254038],
                    [-0.5, -0.8660254038],
                    [0.5, -0.8660254038],
                    [-0.5, 0.8660254038],
                  ].map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={120 + x * 38}
                      cy={120 + y * 38}
                      r="38"
                    />
                  ))}
                </g>
              </svg>
              <span>ARCANUM</span>
            </div>
          )}
          <div
            className={orbit ? "pillar-orbit-ring" : "pillar-list-items"}
            style={
              orbit
                ? ({
                    "--ring-turn": `${(-turn * 360) / items.length}deg`,
                  } as CSSProperties)
                : undefined
            }
          >
            {items.map((p, index) => {
              const angle = ((index - active) * 2 * Math.PI) / items.length;
              const depth = (Math.cos(angle) + 1) / 2;
              const style = orbit
                ? ({
                    "--card-angle": `${(index * 360) / items.length}deg`,
                    "--card-counter": `${((turn - index) * 360) / items.length}deg`,
                    "--card-opacity": active === index ? 1 : 0.16 + depth * 0.5,
                    "--card-mask":
                      active === index
                        ? "linear-gradient(#000, #000)"
                        : `linear-gradient(${Math.sin(angle) > 0 ? "to right" : "to left"}, #000 15%, #0009 58%, transparent 98%)`,
                  } as CSSProperties)
                : undefined;
              return (
                <Link
                  className={`public-pillar-card pillar-${p.slug} ${active === index ? "is-selected" : ""}`}
                  href={
                    home ? `/explore#pillar-${p.slug}` : `/explore/${p.slug}`
                  }
                  id={`pillar-${p.slug}`}
                  key={p.slug}
                  style={style}
                  role={enhanced && !home ? "button" : undefined}
                  aria-label={enhanced ? `About ${p.name}` : undefined}
                  aria-haspopup={enhanced && !home ? "dialog" : undefined}
                  tabIndex={orbit && active !== index ? -1 : undefined}
                  aria-hidden={orbit && active !== index ? true : undefined}
                  onClick={
                    enhanced && !home
                      ? (event) => {
                          event.preventDefault();
                          choose(index);
                          setDetail(index);
                        }
                      : undefined
                  }
                  onKeyDown={
                    enhanced && !home
                      ? (event) => {
                          if (event.key === " ") {
                            event.preventDefault();
                            choose(index);
                            setDetail(index);
                          }
                        }
                      : undefined
                  }
                >
                  <span className="public-card-number">
                    {p.number}
                    <span
                      className={`public-orbit-mark orbit-${p.slug}`}
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 80 80"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle cx="40" cy="40" r="29" />
                        <circle cx="40" cy="40" r="18" />
                        <ellipse
                          cx="40"
                          cy="40"
                          rx="35"
                          ry="12"
                          transform="rotate(-35 40 40)"
                        />
                        <path d="M40 3v9M40 68v9M3 40h9M68 40h9" />
                        <circle
                          cx="40"
                          cy="40"
                          r="3"
                          fill="currentColor"
                          stroke="none"
                        />
                      </svg>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </span>
                  <p className="public-label">{p.theme}</p>
                  <h3>{p.name}</h3>
                  <p>{p.summary}</p>
                  <span className="public-card-link">
                    {enhanced ? "About" : "Explore"} {p.name}{" "}
                    <span aria-hidden="true">→</span>
                  </span>{" "}
                </Link>
              );
            })}
          </div>
        </div>
        {orbit && (
          <div className="pillar-orbit-stepper">
            <button
              type="button"
              onClick={() => select(-1)}
              aria-label="Previous pillar"
              aria-controls={id}
            >
              ←
            </button>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {items[active].name}{" "}
              <span>
                {active + 1} / {items.length}
              </span>
            </p>
            <button
              type="button"
              onClick={() => select(1)}
              aria-label="Next pillar"
              aria-controls={id}
            >
              →
            </button>
          </div>
        )}
      </div>
      {orbit && (
        <div className="pillar-orbit-controls">
          <div className="pillar-orbit-picker" aria-label="Choose a pillar">
            {items.map((p, index) => (
              <button
                type="button"
                key={p.slug}
                aria-pressed={active === index}
                onClick={() => choose(index)}
                aria-controls={id}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {detail !== null && (
        <dialog
          ref={dialog}
          className="pillar-detail"
          aria-labelledby={`${id}-detail-title`}
          onClose={() => {
            setDetail(null);
            if (window.location.hash.startsWith("#pillar-")) {
              window.history.replaceState(
                window.history.state,
                "",
                window.location.pathname + window.location.search,
              );
            }
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              const bounds = event.currentTarget.getBoundingClientRect();
              if (
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom
              )
                dialog.current?.close();
            }
          }}
        >
          <button
            type="button"
            className="pillar-detail-close"
            onClick={() => dialog.current?.close()}
            aria-label="Close pillar details"
          >
            ×
          </button>
          <p className="public-eyebrow">
            {items[detail].name} · {items[detail].theme}
          </p>
          <h2 id={`${id}-detail-title`}>{items[detail].title}</h2>
          <p>{items[detail].intro}</p>
          <div className="pillar-detail-status">
            <h3>Where it stands</h3>
            <p>{items[detail].status}</p>
          </div>
          <Link
            className="pillar-detail-link"
            href={`/explore/${items[detail].slug}`}
          >
            Explore the full {items[detail].name} page{" "}
            <span aria-hidden="true">→</span>
          </Link>
        </dialog>
      )}
    </div>
  );
}
