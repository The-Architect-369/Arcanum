'use client';
import { useEffect } from 'react';

/**
 * ActiveSectionObserver
 * Delayed activation to align with stabilized scroll position.
 * Ensures first section (#hero) is marked active after hydration.
 */
export default function ActiveSectionObserver() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('.snap-section')
      );
      if (!sections.length) return;

      let current: HTMLElement | null = null;

      const io = new IntersectionObserver(
        (entries) => {
          let best: IntersectionObserverEntry | null = null;
          for (const e of entries) {
            if (
              e.isIntersecting &&
              (!best || e.intersectionRatio > best.intersectionRatio)
            ) {
              best = e;
            }
          }

          if (best && best.intersectionRatio >= 0.4) {
            if (current !== best.target) {
              current?.removeAttribute('data-active');
              current = best.target as HTMLElement;
              current.setAttribute('data-active', 'true');
            }
          }
        },
        { root: null, threshold: [0.2, 0.4, 0.6, 0.8, 0.95] }
      );

      // Ensure Hero is active by default
      const first = sections[0];
      if (first) {
        first.setAttribute('data-active', 'true');
        current = first;
      }

      // Begin observing sections
      sections.forEach((s) => io.observe(s));

      return () => io.disconnect();
    }, 160); // Slightly delayed to ensure scroll reset already occurred

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
