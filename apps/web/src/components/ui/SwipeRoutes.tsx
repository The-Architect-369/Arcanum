'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { directionForRoute, primeRouteMotion } from '@/lib/mobile/routeMotion';

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
  const previousPathname = useRef<string>(pathname);
  const navigating = useRef(false);

  const H = 10;
  const SLOPE = 1.02;
  const MAX_PULL = 86;
  const RESET_MS = 70;
  const EXIT_MS = 260;

  useEffect(() => {
    const prev = previousPathname.current;

    if (pathname !== prev) {
      document.documentElement.dataset.cardDirection = directionForRoute(prev, pathname);
    }

    previousPathname.current = pathname;
    navigating.current = false;
    clearPullStyles();
  }, [pathname]);

  useEffect(() => {
    order.forEach((href) => router.prefetch(href));
  }, [order, router]);

  const clearPullStyles = () => {
    const el = shellRef.current;
    if (!el) return;
    el.style.transition = '';
    el.style.transform = '';
    el.style.opacity = '';
  };

  const setPull = (px: number, transition = false) => {
    const el = shellRef.current;
    if (!el) return;
    el.style.transition = transition ? `transform ${RESET_MS}ms cubic-bezier(.16,.74,.18,1)` : 'none';
    el.style.transform = `translate3d(${px}px, 0, 0)`;
    el.style.opacity = '1';
  };

  const resetPull = () => {
    setPull(0, true);
    window.setTimeout(clearPullStyles, RESET_MS + 18);
  };

  const spawnExitGhost = (direction: 'next' | 'prev') => {
    const el = shellRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const ghost = el.cloneNode(true) as HTMLElement;
    const transform = el.style.transform || 'translate3d(0, 0, 0)';
    const exitX = direction === 'next' ? '-38%' : '38%';

    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.position = 'fixed';
    ghost.style.inset = 'auto';
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.zIndex = '45';
    ghost.style.pointerEvents = 'none';
    ghost.style.overflow = 'hidden';
    ghost.style.transform = transform;
    ghost.style.opacity = '1';
    ghost.style.transition = `transform ${EXIT_MS}ms cubic-bezier(.16,.74,.18,1), opacity ${EXIT_MS}ms ease-out`;
    ghost.style.willChange = 'transform, opacity';

    document.body.appendChild(ghost);

    window.requestAnimationFrame(() => {
      ghost.style.transform = `translate3d(${exitX}, 0, 0)`;
      ghost.style.opacity = '0';
    });

    window.setTimeout(() => ghost.remove(), EXIT_MS + 48);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (navigating.current) return;
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    locked.current = null;
    setPull(0);
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
      const eased = Math.max(-MAX_PULL, Math.min(MAX_PULL, dx * 0.5));
      setPull(eased);
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
    navigating.current = true;
    primeRouteMotion(pathname, target);
    spawnExitGhost(direction);
    clearPullStyles();
    router.push(target);
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
