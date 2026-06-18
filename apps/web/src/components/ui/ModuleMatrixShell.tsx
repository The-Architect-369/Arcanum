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
  const frameTop = -1;
  const frameHeight = 42;
  const shellLeft = 58;
  const shellWidth = 148;
  const navWidth = shellLeft + shellWidth;
  const navShiftRight = 18;
  const sectionWidth = shellWidth / segmentCount;
  const shellBorder = 'rgba(255,255,255,0.08)';
  const dividerBorder = 'rgba(255,255,255,0.07)';
  const activeFillRadius =
    activeHorizontalIndex === 0
      ? '1rem 0.42rem 0.2rem 1rem'
      : activeHorizontalIndex === segmentCount - 1
        ? '0.42rem 1rem 0.88rem 0.2rem'
        : '0.42rem';

  const headerActions = (
    <div className="flex items-start justify-end" data-no-route-swipe="true">
      <nav
        aria-label="Horizontal card navigation"
        className="relative h-[2.76rem] shrink-0"
        style={{ width: `${navWidth}px`, transform: `translateX(${navShiftRight}px)` }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            top: `${frameTop}px`,
            left: `${shellLeft}px`,
            width: `${shellWidth}px`,
            height: `${frameHeight}px`,
            borderLeft: `1px solid ${shellBorder}`,
            borderBottom: `1px solid ${shellBorder}`,
            borderBottomLeftRadius: '1rem',
          }}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-10 overflow-hidden"
          style={{
            top: `${frameTop}px`,
            left: `${shellLeft}px`,
            width: `${shellWidth}px`,
            height: `${frameHeight}px`,
            borderRadius: '1rem 1rem 0.88rem 1rem',
          }}
        >
          <span
            className="absolute inset-y-0"
            style={{
              left: `${activeHorizontalIndex * sectionWidth}px`,
              width: `${sectionWidth}px`,
              borderRadius: activeFillRadius,
              background: 'linear-gradient(180deg,rgba(125,190,255,.06),rgba(125,190,255,.016))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.03), inset 0 -10px 18px rgba(12,18,32,.12), 0 0 12px rgba(125,190,255,.08)',
            }}
          />
        </span>

        {horizontalTabs.map((_, index) =>
          index < segmentCount - 1 ? (
            <span
              key={`divider-${index}`}
              aria-hidden="true"
              className="pointer-events-none absolute z-30 w-px"
              style={{
                left: `${shellLeft + (index + 1) * sectionWidth}px`,
                top: `${frameTop + 8}px`,
                height: `${frameHeight - 16}px`,
                background: dividerBorder,
              }}
            />
          ) : null
        )}

        {horizontalTabs.map((tab, index) => {
          const left = shellLeft + index * sectionWidth;
          const isActive = index === activeHorizontalIndex;
          const zoneStyle: React.CSSProperties = {
            left: `${left}px`,
            top: `${frameTop}px`,
            width: `${sectionWidth}px`,
            height: `${frameHeight}px`,
          };
          const inner = <span className="sr-only">{index + 1}. {tab.label}</span>;

          const content = (
            <>
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 z-40 h-5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200 shadow-[0_0_10px_rgba(125,190,255,.62)] sm:h-6"
                />
              ) : null}
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-[12px] z-40 h-[3px] w-[calc(100%-24px)] rounded-t-full bg-[rgba(8,12,22,1)] shadow-[0_0_8px_rgba(125,190,255,.24)]"
                />
              ) : null}
              {inner}
            </>
          );

          if (onHorizontalChange) {
            return (
              <button
                key={tab.href}
                type="button"
                aria-label={tab.label}
                aria-pressed={isActive}
                title={tab.label}
                onClick={() => onHorizontalChange(tab.href)}
                className="absolute z-20"
                style={zoneStyle}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              title={tab.label}
              className="absolute z-20"
              style={zoneStyle}
            >
              {content}
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
        headerActionsDockChrome={false}
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
