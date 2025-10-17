"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@shared/lib/cn";
import { copy } from "@/content/narrative";

type Variant = "arcnet" | "mana" | "tempus";

export default function BentoShowcase({ variant, className }: { variant: Variant; className?: string; }) {
  const data = copy.showcase[variant];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
  }, [index]);

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
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        });
        setIndex(bestIdx);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(data.items.length - 1, i + 1));

  return (
    <div
      className={cn(
        "relative w-full max-w-[94vw] sm:max-w-[720px] md:max-w-[960px] lg:max-w-[1100px] mx-auto",
        "min-h-[480px] sm:min-h-[560px] md:min-h-[640px] lg:min-h-[720px]",
        "rounded-2xl bg-neutral-900/60 backdrop-blur-md border border-white/10 shadow-lg",
        "flex flex-col items-center justify-center text-center p-6 sm:p-8",
        className
      )}
    >
      <h2 className="h2 gradient-text">{data.heading}</h2>
      {data.sub && <p className="lead mt-1 mb-4">{data.sub}</p>}

      <div className="relative w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth justify-center"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {data.items.map((it, i) => (
            <article
              key={i}
              className="shrink-0 bg-[#0b1627]/60 border border-white/10 rounded-xl p-4 text-center"
              style={{
                width: "clamp(260px, 80vw, 320px)",
                scrollSnapAlign: "center",
              }}
            >
              <Image
                src={it.image || "/logo-arcanum.svg"}
                alt={it.title}
                width={44}
                height={44}
                className="object-contain mx-auto mb-3"
              />
              <h4 className="font-semibold mb-1">{it.title}</h4>
              <p className="text-sm opacity-80">{it.body}</p>
            </article>
          ))}
        </div>

        {/* Dots */}
        <div className="mt-3 flex justify-center gap-2" aria-live="polite">
          {data.items.map((_, i) => (
            <span
              key={i}
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full transition-colors duration-300",
                i === index ? "bg-cyan-300" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
