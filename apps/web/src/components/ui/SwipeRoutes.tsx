'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Wrap page content to enable horizontal swipe navigation across an ordered set of hrefs.
 * Mobile: swipe left/right to go next/prev while allowing normal vertical scroll.
 */
export default function SwipeRoutes({
  order,
  children,
}: {
  order: readonly string[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef<'h' | 'v' | null>(null);
  const previousIndex = useRef<number>(order.indexOf(pathname));
  const releaseTimer = useRef<number | null>(null);

  const H = 28;
  const SLOPE = 1.18;
  const MAX_PULL = 18;
  const RELEASE_MS = 120;

  useEffect(() => {
    const idx = order.indexOf(pathname);
    const prev = previousIndex.current;

    if (idx !== -1 && prev !== -1 && idx !== prev) {
      document.documentElement.dataset.cardDirection = idx > prev ? 'next' : 'prev';
    }

    previousIndex.current = idx;
  }, [order, pathname]);

  useEffect(() => {
    order.forEach((href) => router.prefetch(href));
  }, [order, router]);

  useEffect(() => {
    return () => {
      if (releaseTimer.current) window.clearTimeout(releaseTimer.current);
    };
  }, []);

  const setPull = (px: number, transition = false) => {
    const el = shellRef.current;
    if (!el) return;
    el.style.transition = transition ? `transform ${RELEASE_MS}ms cubic-bezier(.18,.82,.24,1), opacity ${RELEASE_MS}ms ease-out` : 'none';
    el.style.transform = `translate3d(${px}px, 0, 0)`;
    el.style.opacity = px === 0 ? '1' : '0.986';
  };

  const resetPull = () => {
    setPull(0, true);
    window.setTimeout(() => {
      const el = shellRef.current;
      if (!el) return;
      el.style.transition = '';
      el.style.transform = '';
      el.style.opacity = '';
    }, RELEASE_MS + 40);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (releaseTimer.current) window.clearTimeout(releaseTimer.current);
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    locked.current = null;
    setPull(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!start.current) return;
    const t = e.touches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (!locked.current) {
      if (ax >= H && ax > ay * SLOPE) locked.current = 'h';
      else if (ay >= H && ay > ax) locked.current = 'v';
      else return;
    }

    if (locked.current === 'h') {
      e.preventDefault();
      const eased = Math.max(-MAX_PULL, Math.min(MAX_PULL, dx * 0.12));
      setPull(eased);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!start.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;

    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ax < H || ax <= ay * SLOPE) {
      resetPull();
      return;
    }

    const idx = order.indexOf(pathname);
    if (idx === -1) {
      resetPull();
      return;
    }

    const next = dx < 0 && idx < order.length - 1;
    const prev = dx > 0 && idx > 0;

    if (!next && !prev) {
      resetPull();
      return;
    }

    const direction = next ? 'next' : 'prev';
    const target = next ? order[idx + 1] : order[idx - 1];
    document.documentElement.dataset.cardDirection = direction;
    setPull(next ? -MAX_PULL : MAX_PULL, true);

    releaseTimer.current = window.setTimeout(() => {
      router.push(target);
      resetPull();
    }, RELEASE_MS);
  };

  return (
    <div
      ref={shellRef}
      className="h-full min-h-0 touch-pan-y will-change-transform"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}
