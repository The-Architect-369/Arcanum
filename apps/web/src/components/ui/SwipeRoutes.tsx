'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { directionForRoute, primeRouteMotion } from '@/lib/mobile/routeMotion';

/**
 * Wrap page content to enable horizontal swipe navigation across an ordered set of hrefs.
 * Mobile: swipe left/right to go next/prev through explicit route gesture zones when present,
 * otherwise fall back to the full wrapped surface.
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
    const root = rootRef.current;
    if (!root) return;

    let start: { x: number; y: number } | null = null;
    let locked: 'h' | 'v' | null = null;

    const isRouteZoneTarget = (target: EventTarget | null) => {
      const hasExplicitZones = Boolean(root.querySelector('[data-route-swipe-zone="true"]'));
      if (!hasExplicitZones) return true;
      return target instanceof HTMLElement && Boolean(target.closest('[data-route-swipe-zone="true"]'));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (navigating.current) return;
      if (!isRouteZoneTarget(e.target)) return;
      const t = e.touches[0];
      if (!t) return;
      start = { x: t.clientX, y: t.clientY };
      locked = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!start || navigating.current) return;
      const t = e.touches[0];
      if (!t) return;

      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);

      if (!locked) {
        if (ax >= H && ax > ay * SLOPE) locked = 'h';
        else if (ay >= H && ay > ax) locked = 'v';
        else return;
      }

      if (locked === 'h') {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!start || navigating.current) return;
      const t = e.changedTouches[0];
      if (!t) return;

      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      start = null;

      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (ax < H || ax <= ay * SLOPE) return;

      const idx = order.indexOf(pathname);
      if (idx === -1) return;

      const next = dx < 0 && idx < order.length - 1;
      const prev = dx > 0 && idx > 0;
      if (!next && !prev) return;

      const target = next ? order[idx + 1] : order[idx - 1];
      navigating.current = true;
      primeRouteMotion(pathname, target);
      router.push(target);
    };

    const onTouchCancel = () => {
      start = null;
      locked = null;
    };

    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    root.addEventListener('touchend', onTouchEnd, { passive: true });
    root.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [order, pathname, router]);

  return (
    <div ref={rootRef} className="h-full min-h-0">
      {children}
    </div>
  );
}
