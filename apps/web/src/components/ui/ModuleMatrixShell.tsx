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
  const segmentCount = Math.max(horizontalTabs.length, 1);
  const segmentWidth = 41;
  const pocketTop = 0;
  const pocketHeight = 38;
  const railTop = 4;
  const railHeight = 30;
  const railWidth = segmentCount * segmentWidth;
  const activeLeft = activeHorizontalIndex * segmentWidth;
  const motion = '180ms';
  const shellBorder = 'rgba(255,255,255,0.12)';
  const shellBorderSoft = 'rgba(255,255,255,0.09)';

  const headerActions = (
    <div className="flex items-start justify-end" data-no-route-swipe="true">
      <nav aria-label="Horizontal card navigation" className="relative h-[2.56rem] shrink-0" style={{ width: `${railWidth + 8}px` }}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bg-[linear-gradient(180deg,rgba(255,255,255,.012),rgba(18,28,56,.022)_50%,rgba(8,12,22,.008))] shadow-[inset_0_1px_0_rgba(255,255,255,.018)]"
          style={{
            top: `${pocketTop}px`,
            right: '-4px',
            width: `${railWidth + 8}px`,
            height: `${pocketHeight}px`,
            border: `1px solid ${shellBorderSoft}`,
            borderTopRightRadius: '1.08rem',
            borderBottomLeftRadius: '1.16rem',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-px bg-gradient-to-r from-transparent via-white/7 to-transparent"
          style={{ top: `${pocketTop + 15}px`, left: '0px', right: '-4px' }}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[-4px] bg-[linear-gradient(180deg,rgba(255,255,255,.014),rgba(255,255,255,.004))]"
          style={{
            top: `${railTop}px`,
            width: `${railWidth + 5}px`,
            height: `${railHeight}px`,
            border: `1px solid ${shellBorder}`,
            borderRadius: '1rem',
          }}
        />

        {horizontalTabs.map((tab, index) => {
          if (index === 0) return null;
          return (
            <span
              key={`divider-${tab.href}`}
              aria-hidden="true"
              className="pointer-events-none absolute z-30 h-[22px] w-px bg-white/10"
              style={{ left: `${index * segmentWidth}px`, top: `${railTop + 4}px` }}
            />
          );
        })}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-20 bg-[linear-gradient(180deg,rgba(246,196,83,.05),rgba(246,196,83,.014))] transition-all ease-out"
          style={{
            top: `${railTop}px`,
            left: `${activeLeft}px`,
            width: `${segmentWidth}px`,
            height: `${railHeight}px`,
            border: `1px solid ${shellBorder}`,
            borderRadius:
              activeHorizontalIndex === 0
                ? '1rem 0.46rem 0.46rem 1rem'
                : activeHorizontalIndex === segmentCount - 1
                  ? '0.46rem 1rem 1rem 0.46rem'
                  : '0.46rem',
            transitionDuration: motion,
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-40 h-[1.12rem] w-[1.5px] rounded-full bg-amber-100 shadow-[0_0_3px_rgba(246,196,83,.10)] transition-all ease-out"
          style={{
            top: `${railTop + 6}px`,
            left: `${activeLeft + segmentWidth / 2 - 0.75}px`,
            transitionDuration: motion,
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-40 h-[3px] rounded-t-full bg-[rgba(8,12,22,1)] transition-all ease-out"
          style={{
            top: `${railTop + railHeight - 1}px`,
            left: `${activeLeft + 8}px`,
            width: `${segmentWidth - 16}px`,
            transitionDuration: motion,
          }}
        />

        {horizontalTabs.map((tab, index) => {
          const zoneStyle: React.CSSProperties = {
            left: `${index * segmentWidth}px`,
            top: `${railTop}px`,
            width: `${segmentWidth}px`,
            height: `${railHeight}px`,
          };
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
                className="absolute z-50"
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
              className="absolute z-50"
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
          <div className="relative z-10 h-full min-h-0 overflow-hidden">{children}</div>
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
