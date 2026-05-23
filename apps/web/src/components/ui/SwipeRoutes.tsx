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
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef<'h' | 'v' | null>(null);
  const previousIndex = useRef<number>(order.indexOf(pathname));

  const H = 28;
  const SLOPE = 1.2;

  useEffect(() => {
    const idx = order.indexOf(pathname);
    const prev = previousIndex.current;

    if (idx !== -1 && prev !== -1 && idx !== prev) {
      document.documentElement.dataset.cardDirection = idx > prev ? 'next' : 'prev';
    }

    previousIndex.current = idx;
  }, [order, pathname]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    locked.current = null;
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

    if (locked.current === 'h') e.preventDefault();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!start.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;

    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ax < H || ax <= ay * SLOPE) return;

    const idx = order.indexOf(pathname);
    if (idx === -1) return;

    if (dx < 0 && idx < order.length - 1) {
      document.documentElement.dataset.cardDirection = 'next';
      router.push(order[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      document.documentElement.dataset.cardDirection = 'prev';
      router.push(order[idx - 1]);
    }
  };

  return (
    <div
      className="h-full min-h-0 touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}
