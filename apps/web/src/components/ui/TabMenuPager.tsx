'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type TabKey = string;

const H_THRESH = 24;  // >=24px horizontal before 8px vertical
const V_THRESH = 8;
const ANGLE_DEG = 30; // ~30° from vertical to switch

export default function TabMenuPager({
  keys,
  defaultIndex = 1, // center by default
  render,
}: {
  keys: TabKey[];
  defaultIndex?: number;
  render: (activeKey: TabKey) => React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  // derive initial from ?tab=, else center
  const tabParam = params.get('tab');
  const initialIndex = Math.max(
    0,
    tabParam ? keys.indexOf(tabParam) : defaultIndex
  );
  const [index, setIndex] = useState(initialIndex);

  // replaceState on change (keep history clean)
  useEffect(() => {
    const key = keys[index] ?? keys[defaultIndex] ?? keys[0];
    const url = `${pathname}?tab=${encodeURIComponent(key)}`;
    // Avoid pushing if URL already matches
    const current = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    if (current !== url) router.replace(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, pathname]);

  // Touch/drag swipe handling with “vertical priority” rule
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef<'h' | 'v' | null>(null);

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
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      // Prioritize vertical unless mostly horizontal
      if (absX >= H_THRESH && absY <= V_THRESH) locked.current = 'h';
      else if (absY > V_THRESH) locked.current = 'v';
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
    const mostlyHorizontal = angle <= ANGLE_DEG;

    if (mostlyHorizontal && Math.abs(dx) > H_THRESH) {
      if (dx < 0 && index < keys.length - 1) setIndex(index + 1);
      else if (dx > 0 && index > 0) setIndex(index - 1);
    }
  };

  const activeKey = keys[index] ?? keys[defaultIndex] ?? keys[0];

  return (
    <div
      className="relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {render(activeKey)}
    </div>
  );
}
