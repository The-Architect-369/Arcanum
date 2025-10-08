"use client";

import { useEffect, useRef, useState } from "react";
import BentoCard from "@/components/ui/BentoCard"; // keep your existing path
// If your BentoCard lives at "@/components/BentoCard", change the import accordingly.

// Tiny classnames helper
const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

export type ShowcaseItem = { title: string; desc: string };

export default function BentoShowcase({
  title,
  description,
  items,
  className,
  showCta = false,
  ctaHref = "/",
  ctaLabel = "Learn More",
}: {
  title: string;
  description: string;
  items: ShowcaseItem[];
  className?: string;
  showCta?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const centerTo = (i: number, behavior: ScrollBehavior = "smooth") => {
    const wrap = wrapRef.current, track = trackRef.current;
    if (!wrap || !track) return;
    const node = track.children[i] as HTMLElement | undefined;
    if (!node) return;
    const target = node.offsetLeft + node.offsetWidth / 2 - wrap.clientWidth / 2;
    track.scrollTo({ left: target, behavior });
    setActive(i);
  };

  const count = items.length;
  const next = () => { if (count) centerTo((active + 1) % count); };
  const prev = () => { if (count) centerTo((active - 1 + count) % count); };

  const syncFromScroll = () => {
    const wrap = wrapRef.current, track = trackRef.current;
    if (!wrap || !track || !count) return;
    const viewCenter = track.scrollLeft + wrap.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < track.children.length; i++) {
      const el = track.children[i] as HTMLElement;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - viewCenter);
      if (dist < bestDist) { bestDist = dist; best = i; }
    }
    setActive(best);
  };

  useEffect(() => {
    const track = trackRef.current;
    const onScroll = () => syncFromScroll();
    const onResize = () => centerTo(active, "auto");
    centerTo(0, "auto"); // initial snap
    track?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      track?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  if (!count) {
    return (
      <BentoCard title={title} description={description} className={className}>
        <div className="text-center text-white/70">No items to display.</div>
      </BentoCard>
    );
  }

  return (
    <BentoCard
      stacked
      title={title}
      description={description}
      className={cx("vh-card vh-tall vh-pad", className)}
      bodyClassName="grid grid-rows-[auto,1fr] gap-4 min-h-0"
    >
      <div className="mt-1 flex justify-center">
        {showCta ? <a className="bento-badge" href={ctaHref}>{ctaLabel}</a> : null}
      </div>

      {/* Showcase window */}
      <div ref={wrapRef} className="showcase-wrap">
        <div ref={trackRef} className="showcase-track">
          {items.map((t, i) => (
            <div key={i} className="showcase-item">
              <div className="showcase-panel">
                <h4 className="text-xl md:text-2xl font-semibold tracking-tight">{t.title}</h4>
                <p className="mt-2 text-sm md:text-base text-white/85">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button aria-label="Previous" onClick={prev} className="showcase-arrow left-3">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button aria-label="Next" onClick={next} className="showcase-arrow right-3">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dots (use your existing .dot class) */}
        <div className="showcase-dots">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to ${i + 1}`}
              className="dot"
              data-active={i === active}
              onClick={() => centerTo(i)}
            />
          ))}
        </div>
      </div>
    </BentoCard>
  );
}
