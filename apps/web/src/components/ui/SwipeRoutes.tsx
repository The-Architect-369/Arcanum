'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useRef } from 'react';

/**
 * Wrap page content to enable horizontal swipe navigation across an ordered set of hrefs.
 * - Desktop: no effect (use TabDots clicks).
 * - Mobile: swipe left/right to go next/prev.
 */
export default function SwipeRoutes({
  order,
  children,
}: {
  // Accept readonly tuples or arrays
  order: readonly string[];        // e.g., ['/hope/inventory','/hope/character','/hope/stylize'] as const
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef<'h' | 'v' | null>(null);

  const H = 24;   // horizontal threshold px
  const V = 8;    // vertical threshold px
  const ANG = 30; // degrees from horizontal

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
    if (!locked.current) {
      const ax = Math.abs(dx), ay = Math.abs(dy);
      if (ax >= H && ay <= V) locked.current = 'h';
      else if (ay > V) locked.current = 'v';
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

    const angle = Math.atan2(Math.abs(dy), Math.abs(dx)) * (180 / Math.PI);
    const mostlyH = angle <= ANG;
    if (!mostlyH || Math.abs(dx) <= H) return;

    const idx = order.indexOf(pathname);
    if (idx === -1) return;

    if (dx < 0 && idx < order.length - 1) {
      router.replace(order[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      router.replace(order[idx - 1]);
    }
  };

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {children}
    </div>
  );
}
