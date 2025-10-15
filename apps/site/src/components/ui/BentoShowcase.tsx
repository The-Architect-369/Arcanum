"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { copy } from "@/content/narrative";

type Variant = "arcnet" | "mana" | "tempus";

type ShowcaseItem = {
  title: string;
  body: string;
};

type ShowcaseCopy = {
  heading: string;
  sub?: string;
  items: ShowcaseItem[];
};

function normalizeShowcase(variant: Variant): ShowcaseCopy {
  const anyCopy: any = copy as any;

  const candidates: any[] = [
    anyCopy?.showcase?.[variant],
    anyCopy?.[variant]?.showcase,
    anyCopy?.[variant],
  ].filter(Boolean);

  const src = candidates[0] ?? {
    heading: variant === "arcnet" ? "Welcome to ARCnet" :
             variant === "mana"   ? "Welcome to MANA"   :
                                     "Welcome to Tempus",
    sub: "",
    items: [],
  };

  const heading: string =
    src.heading ?? src.title ?? src.name ?? String(variant).toUpperCase();

  const sub: string | undefined =
    src.sub ?? src.subtitle ?? src.description ?? src.copy ?? undefined;

  let rawItems: any[] =
    src.items ?? src.tiles ?? src.cards ?? src.points ?? [];

  if (rawItems.length && typeof rawItems[0] === "string") {
    rawItems = (rawItems as string[]).map((s) => ({ title: s, body: "" }));
  }

  const items: ShowcaseItem[] = rawItems.map((it: any) => ({
    title: it.title ?? it.name ?? "",
    body: it.body ?? it.description ?? it.copy ?? "",
  }));

  const fallbackItems: ShowcaseItem[] =
    items.length
      ? items
      : [
          { title: "Coming soon", body: "This showcase is being prepared." },
          { title: "Editing narrative.ts", body: "Add items to copy.showcase." },
          { title: "Placeholders", body: "Tiles accept title, body, and image." },
          { title: "Carousel", body: "Swipe on mobile, arrows on desktop." },
          { title: "Reusable", body: "Same shell for each variant." },
        ];

  return { heading, sub, items: fallbackItems };
}

type Props = {
  variant: Variant;
  className?: string;
};

export default function BentoShowcase({ variant, className }: Props) {
  const data = normalizeShowcase(variant);

  // native scroll-snap track
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  // snap to active index
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
  }, [index]);

  // update dot on scroll
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const children = Array.from(el.children) as HTMLElement[];
        let bestIdx = 0;
        let bestDist = Infinity;
        const mid = el.scrollLeft + el.clientWidth / 2;

        children.forEach((c, i) => {
          const rect = c.getBoundingClientRect();
          const cMid = rect.left + rect.width / 2 + el.scrollLeft - el.getBoundingClientRect().left;
          const dist = Math.abs(cMid - mid);
          if (dist < bestDist) { bestDist = dist; bestIdx = i; }
        });
        setIndex(bestIdx);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(data.items.length - 1, i + 1));

  // Width targets so 3 tiles fit with side peeks at typical laptop widths.
  const tileWidth = "clamp(280px, 28vw, 340px)";

  return (
    <div className={cn("bento-width bento-pad card glow-cyan popcard text-center", className)}>
      {data.heading && <h2 className="h2 gradient-text">{data.heading}</h2>}
      {!!data.sub && <p className="lead mt-1 mb-4">{data.sub}</p>}

      <div className="relative">
        <div
          className="flex items-stretch gap-4 overflow-x-auto no-scrollbar px-2"
          ref={trackRef}
          style={{ scrollSnapType: "x mandatory" }}
        >
          {data.items.map((it, i) => (
            <article
              key={i}
              className="tile-shimmer tile--cyan bento-item text-left shrink-0"
              style={{ width: tileWidth, scrollSnapAlign: "center" }}
            >
              {/* Square content area */}
              <div className="aspect-square flex flex-col items-center justify-start">
                {/* small image slot (logo placeholder) */}
                <div className="tile-media">
                  <Image
                    src="/logo-arcanum.svg"
                    alt="Arcanum"
                    width={44}
                    height={44}
                    className="object-contain"
                    priority
                  />
                </div>

                {!!it.title && <h4 className="font-semibold mb-1 text-center">{it.title}</h4>}
                {!!it.body && <p className="text-ink-muted text-center">{it.body}</p>}
              </div>
            </article>
          ))}
        </div>

        {/* ARROWS */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1">
          <button
            aria-label="Previous"
            onClick={prev}
            className="pointer-events-auto hidden sm:inline-flex cta-orb px-3 py-2"
            disabled={index === 0}
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="pointer-events-auto hidden sm:inline-flex cta-orb px-3 py-2"
            disabled={index === data.items.length - 1}
          >
            ›
          </button>
        </div>

        {/* DOTS */}
        <div className="mt-3 flex justify-center gap-2" aria-live="polite">
          {data.items.map((_, i) => (
            <span
              key={i}
              aria-label={`Slide ${i+1} of ${data.items.length}${i===index ? ', current' : ''}`}
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                i === index ? "bg-cyan-300" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
