"use client";
import { useEffect } from "react";

export default function ActiveSectionObserver() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".snap-section"));
    if (!sections.length) return;

    let current: HTMLElement | null = null;

    const io = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) {
            best = e;
          }
        }
        if (best && best.intersectionRatio >= 0.4) {
          if (current !== best.target) {
            current?.removeAttribute("data-active");
            current = best.target as HTMLElement;
            current.setAttribute("data-active", "true");
          }
        } else if (!current) {
          const first = sections[0];
          first?.setAttribute("data-active", "true");
          current = first;
        }
      },
      { root: null, threshold: [0.2, 0.4, 0.6, 0.8, 0.95] }
    );

    sections.forEach((s) => io.observe(s));
    sections[0]?.setAttribute("data-active", "true");
    current = sections[0] ?? null;

    return () => io.disconnect();
  }, []);

  return null;
}
