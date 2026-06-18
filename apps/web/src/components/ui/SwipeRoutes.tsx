'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { directionForRoute, primeRouteMotion } from '@/lib/mobile/routeMotion';

/**
 * Wrap page content to enable horizontal swipe navigation across an ordered set of hrefs.
 * Mobile: swipe left/right to go next/prev across the wrapped surface,
 * except inside regions marked data-no-route-swipe="true".
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef<'h' | 'v' | null>(null);
  const previousPathname = useRef<string>(pathname);
  const navigating = useRef(false);

  const H = 12;
  const SLOPE = 1.06;

  useEffect(() => {
    const prev = previousPathname.current;

    if (pathname !== prev) {
      document.documentElement.dataset.cardDirection = directionForRoute(prev, pathname);
    }

    previousPathname.current = pathname;
    navigating.current = false;
  }, [pathname]);

  useEffect(() => {
    order.forEach((href) => router.prefetch(href));
  }, [order, router]);

  useEffect(() => {
    const idx = order.indexOf(pathname);
    if (idx === -1) return;

    const current = order[idx];
    const prev = idx > 0 ? order[idx - 1] : null;
    const next = idx < order.length - 1 ? order[idx + 1] : null;

    router.prefetch(current);
    if (prev) router.prefetch(prev);
    if (next) router.prefetch(next);
  }, [order, pathname, router]);

  const isRouteSwipeAllowed = (target: EventTarget | null) => {
    return !(target instanceof HTMLElement && target.closest('[data-no-route-swipe="true"]'));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (navigating.current) return;
    if (!isRouteSwipeAllowed(e.target)) return;
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    locked.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!start.current || navigating.current) return;
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
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!start.current || navigating.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;

    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ax < H || ax <= ay * SLOPE) return;

    const idx = order.indexOf(pathname);
    if (idx === -1) return;

    const next = dx < 0 && idx < order.length - 1;
    const prev = dx > 0 && idx > 0;

    if (!next && !prev) return;

    const target = next ? order[idx + 1] : order[idx - 1];
    router.prefetch(target);
    navigating.current = true;
    primeRouteMotion(pathname, target);
    router.push(target);
  };

  return (
    <div
      ref={rootRef}
      className="h-full min-h-0"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}
