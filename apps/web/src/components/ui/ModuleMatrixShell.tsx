'use client';

import Link from 'next/link';
import * as React from 'react';
import PanelShell from '@/components/ui/PanelShell';
import { cn } from '@/lib/cn';

type HorizontalTab = {
  href: string;
  label: string;
  shortLabel?: string;
};

type VerticalTab = {
  id: string;
  label: string;
};

type ModuleMatrixShellProps = {
  title: React.ReactNode;
  actions?: React.ReactNode;
  horizontalTabs: readonly HorizontalTab[];
  activeHorizontalHref: string;
  onHorizontalChange?: (href: string) => void;
  verticalTabs: readonly VerticalTab[];
  activeVerticalId: string;
  onVerticalChange: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function ModuleMatrixShell({
  title,
  actions,
  horizontalTabs,
  activeHorizontalHref,
  onHorizontalChange,
  verticalTabs,
  activeVerticalId,
  onVerticalChange,
  children,
  className,
  contentClassName,
}: ModuleMatrixShellProps) {
  const contentGestureRef = React.useRef<HTMLDivElement | null>(null);
  const navigating = React.useRef(false);

  const activeVerticalIndex = React.useMemo(
    () => Math.max(0, verticalTabs.findIndex((tab) => tab.id === activeVerticalId)),
    [activeVerticalId, verticalTabs]
  );

  React.useEffect(() => {
    navigating.current = false;
  }, [activeVerticalId]);

  React.useEffect(() => {
    const el = contentGestureRef.current;
    if (!el) return;

    let start: { x: number; y: number } | null = null;
    let locked: 'h' | 'v' | null = null;

    const shouldIgnoreTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(target.closest('a, button, input, textarea, select, [data-no-depth-swipe="true"]'));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (navigating.current) return;
      if (shouldIgnoreTarget(e.target)) return;
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
        if (ay >= 14 && ay > ax * 1.08) locked = 'v';
        else if (ax >= 14 && ax > ay * 1.08) locked = 'h';
        else return;
      }

      if (locked === 'v') {
        e.preventDefault();
        e.stopPropagation();
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
      if (ay < 18 || ay <= ax * 1.08) return;

      const nextIndex = dy < 0 ? activeVerticalIndex + 1 : activeVerticalIndex - 1;
      if (nextIndex < 0 || nextIndex >= verticalTabs.length) return;

      navigating.current = true;
      onVerticalChange(verticalTabs[nextIndex].id);
    };

    const onTouchCancel = () => {
      start = null;
      locked = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [activeVerticalIndex, onVerticalChange, verticalTabs]);

  const activeHorizontalIndex = Math.max(0, horizontalTabs.findIndex((tab) => tab.href === activeHorizontalHref));
  const activeCrestLeft = activeHorizontalIndex * 24;

  const headerActions = (
    <div className="flex items-start justify-end" data-no-route-swipe="true">
      <nav
        aria-label="Horizontal card navigation"
        className="relative h-[3.35rem] w-[7.1rem] shrink-0 sm:h-[3.45rem] sm:w-[7.5rem]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.8rem] rounded-tl-[1.15rem] rounded-tr-[1.45rem] border border-b-0 border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.04),rgba(8,12,22,.015))] shadow-[inset_0_1px_0_rgba(255,255,255,.04)]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[10px] left-[20px] h-[0.9rem] w-px bg-gradient-to-b from-white/14 to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[10px] left-[44px] h-[0.9rem] w-px bg-gradient-to-b from-white/12 to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[10px] left-[68px] h-[0.9rem] w-px bg-gradient-to-b from-white/10 to-transparent"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 z-30 h-[2.72rem] w-[2.55rem] border border-b-0 border-amber-200/72 bg-[linear-gradient(180deg,rgba(246,196,83,.18),rgba(246,196,83,.08)_62%,rgba(8,12,22,0))] shadow-[0_8px_14px_rgba(246,196,83,.08)] transition-all duration-300"
          style={{
            left: activeCrestLeft,
            clipPath: 'polygon(0 100%, 0 40%, 20% 0, 100% 0, 100% 74%, 86% 100%)',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[2px] z-40 h-[0.9rem] w-[1.55rem] rounded-t-[0.72rem] border border-b-0 border-amber-200/56 bg-[linear-gradient(180deg,rgba(246,196,83,.13),rgba(246,196,83,.04))] transition-all duration-300"
          style={{ left: activeCrestLeft + 8 }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[1.2rem] z-40 h-4 w-1.5 rounded-full bg-amber-100 shadow-[0_0_10px_rgba(246,196,83,.55)] transition-all duration-300"
          style={{ left: activeCrestLeft + 18 }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 z-40 h-[3px] w-[2rem] rounded-t-full bg-[rgba(8,12,22,1)] transition-all duration-300"
          style={{ left: activeCrestLeft + 4 }}
        />

        {horizontalTabs.map((tab, index) => {
          const zoneStyle: React.CSSProperties = { left: index * 24, width: 40 };
          const zoneClassName = 'absolute inset-y-0 z-50';
          const inner = <span className="sr-only">{index + 1}. {tab.label}</span>;

          if (onHorizontalChange) {
            return (
              <button
                key={tab.href}
                type="button"
                aria-label={tab.label}
                aria-pressed={index === activeHorizontalIndex}
                title={tab.label}
                onClick={() => onHorizontalChange(tab.href)}
                className={zoneClassName}
                style={zoneStyle}
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={index === activeHorizontalIndex ? 'page' : undefined}
              title={tab.label}
              className={zoneClassName}
              style={zoneStyle}
            >
              {inner}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className={cn('relative h-full min-h-0', className)}>
      <PanelShell
        title={title}
        actions={headerActions}
        flush
        scrollable={false}
        headerActionsDock
        className="relative z-10 min-h-0 flex-1"
        contentClassName={cn('overflow-hidden px-10 sm:px-9', contentClassName)}
      >
        <div className="relative h-full min-h-0 overflow-hidden">
          <div
            ref={contentGestureRef}
            className="absolute inset-0 z-20"
            style={{ touchAction: 'pan-x' }}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full min-h-0 overflow-hidden">
            {children}
          </div>
        </div>
      </PanelShell>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-40 flex items-center pl-2 sm:pl-3" data-no-route-swipe="true">
        <nav
          aria-label="Depth navigation"
          className="pointer-events-auto relative flex w-5 flex-col items-center gap-1 rounded-r-[1rem] border border-l-0 border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.03))] px-1 py-2 shadow-[0_0_18px_rgba(0,0,0,.28)] backdrop-blur-md sm:w-6"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 right-0 w-px bg-gradient-to-b from-transparent via-sky-200/35 to-transparent"
          />
          {verticalTabs.map((tab, index) => {
            const active = tab.id === activeVerticalId;
            return (
              <button
                key={tab.id}
                type="button"
                aria-label={tab.label}
                aria-pressed={active}
                title={tab.label}
                onClick={() => onVerticalChange(tab.id)}
                className={cn(
                  'group relative flex h-12 w-full items-center justify-center rounded-full transition-all duration-300 sm:h-14',
                  active
                    ? 'bg-[linear-gradient(180deg,rgba(125,190,255,.18),rgba(125,190,255,.08))] shadow-[0_0_14px_rgba(125,190,255,.20)]'
                    : 'hover:bg-white/[0.05]'
                )}
              >
                <span className="sr-only">{index + 1}. {tab.label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'block h-5 w-[3px] rounded-full transition-all sm:h-6',
                    active ? 'bg-sky-200 shadow-[0_0_10px_rgba(125,190,255,.62)]' : 'bg-white/38 group-hover:bg-white/58'
                  )}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
