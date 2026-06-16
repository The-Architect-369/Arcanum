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

  const headerActions = (
    <div className="flex items-start justify-end" data-no-route-swipe="true">
      <nav aria-label="Horizontal card navigation" className="relative flex h-12 items-start pr-1 pt-0.5 sm:h-[3.15rem]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1 top-[2.7rem] h-px bg-gradient-to-r from-transparent via-white/16 to-transparent sm:top-[2.9rem]"
        />
        {horizontalTabs.map((tab, index) => {
          const active = tab.href === activeHorizontalHref;
          const frontIndex = horizontalTabs.findIndex((item) => item.href === activeHorizontalHref);
          const depthFromFront = Math.abs(index - frontIndex);
          const offsetY = active ? 0 : Math.min(12, 4 + depthFromFront * 3);
          const offsetX = index === 0 ? 0 : -12;
          const zIndex = active ? 40 : 30 - depthFromFront;
          const tabClassName = cn(
            'relative flex h-11 w-12 items-start justify-center transition-all duration-300 sm:h-[3rem] sm:w-[3.35rem]',
            !active && 'hover:-translate-y-0.5'
          );
          const tabStyle: React.CSSProperties = {
            marginLeft: index === 0 ? 0 : offsetX,
            transform: `translateY(${offsetY}px)`,
            zIndex,
          };
          const folderStyle: React.CSSProperties = {
            clipPath: 'polygon(0 100%, 0 26%, 20% 0, 100% 0, 100% 78%, 86% 100%)',
          };
          const tabInner = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute bottom-0 left-0 right-0 top-0 border transition-all',
                  active
                    ? 'border-amber-200/78 bg-[linear-gradient(180deg,rgba(246,196,83,.22),rgba(246,196,83,.08))] shadow-[0_10px_18px_rgba(246,196,83,.12)]'
                    : 'border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.025))] shadow-[0_8px_14px_rgba(0,0,0,.12)]'
                )}
                style={folderStyle}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-[22%] right-[10%] top-0 h-[30%] rounded-t-[0.9rem] rounded-br-[0.5rem] border border-b-0 transition-all',
                  active
                    ? 'border-amber-200/68 bg-[linear-gradient(180deg,rgba(246,196,83,.18),rgba(246,196,83,.08))]'
                    : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02))]'
                )}
              />
              <span className="sr-only">{index + 1}. {tab.label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-1/2 top-[45%] h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all sm:h-[1.05rem]',
                  active ? 'bg-amber-100 shadow-[0_0_10px_rgba(246,196,83,.55)]' : 'bg-white/34'
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute bottom-[3px] left-[18%] right-[14%] h-px rounded-full transition-all',
                  active ? 'bg-amber-100/58' : 'bg-white/08'
                )}
              />
            </>
          );

          if (onHorizontalChange) {
            return (
              <button
                key={tab.href}
                type="button"
                aria-label={tab.label}
                aria-pressed={active}
                title={tab.label}
                onClick={() => onHorizontalChange(tab.href)}
                className={tabClassName}
                style={tabStyle}
              >
                {tabInner}
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              title={tab.label}
              className={tabClassName}
              style={tabStyle}
            >
              {tabInner}
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
