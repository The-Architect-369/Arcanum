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
  verticalTabs,
  activeVerticalId,
  onVerticalChange,
  children,
  className,
  contentClassName,
}: ModuleMatrixShellProps) {
  const start = React.useRef<{ x: number; y: number } | null>(null);
  const locked = React.useRef<'h' | 'v' | null>(null);
  const navigating = React.useRef(false);

  const activeVerticalIndex = React.useMemo(
    () => Math.max(0, verticalTabs.findIndex((tab) => tab.id === activeVerticalId)),
    [activeVerticalId, verticalTabs]
  );

  React.useEffect(() => {
    navigating.current = false;
  }, [activeVerticalId]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (navigating.current) return;
    if (e.pointerType === 'mouse') return;
    start.current = { x: e.clientX, y: e.clientY };
    locked.current = null;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current || navigating.current) return;
    if (e.pointerType === 'mouse') return;

    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (!locked.current) {
      if (ay >= 14 && ay > ax * 1.08) locked.current = 'v';
      else if (ax >= 14 && ax > ay * 1.08) locked.current = 'h';
      else return;
    }

    if (locked.current === 'v') {
      e.preventDefault();
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current || navigating.current) return;
    if (e.pointerType === 'mouse') return;

    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;

    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ay < 18 || ay <= ax * 1.08) return;

    const nextIndex = dy < 0 ? activeVerticalIndex + 1 : activeVerticalIndex - 1;
    if (nextIndex < 0 || nextIndex >= verticalTabs.length) return;

    navigating.current = true;
    onVerticalChange(verticalTabs[nextIndex].id);
  };

  const onPointerCancel = () => {
    start.current = null;
    locked.current = null;
  };

  const headerActions = (
    <div className="flex items-start gap-3 sm:gap-4">
      <nav aria-label="Horizontal card navigation" className="flex items-end gap-0.5 sm:gap-1">
        {horizontalTabs.map((tab, index) => {
          const active = tab.href === activeHorizontalHref;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              title={tab.label}
              className={cn(
                'relative -mr-px block h-9 w-8 rounded-t-[1rem] border border-b-0 transition-all duration-300 sm:h-10 sm:w-9',
                active
                  ? 'z-20 translate-y-px border-amber-200/75 bg-[linear-gradient(180deg,rgba(246,196,83,.24),rgba(246,196,83,.10))] shadow-[0_0_14px_rgba(246,196,83,.18)]'
                  : 'z-10 mt-2 border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03))] hover:border-white/24 hover:bg-[linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.05))]'
              )}
            >
              <span className="sr-only">{index + 1}. {tab.label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-1/2 top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all',
                  active ? 'bg-amber-100 shadow-[0_0_10px_rgba(246,196,83,.55)]' : 'bg-white/34'
                )}
              />
            </Link>
          );
        })}
      </nav>
      {actions ? <div className="hidden pt-1 text-xs text-zinc-400 sm:block">{actions}</div> : null}
    </div>
  );

  return (
    <div
      className={cn('relative h-full min-h-0', className)}
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <PanelShell
        title={title}
        actions={headerActions}
        flush
        scrollable={false}
        className="min-h-0 flex-1"
        contentClassName={cn('overflow-hidden px-12 sm:px-10', contentClassName)}
      >
        <div className="h-full min-h-0 overflow-hidden">{children}</div>
      </PanelShell>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-2 sm:pl-3">
        <nav aria-label="Depth navigation" className="pointer-events-auto flex flex-col gap-1.5">
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
                  'group relative flex h-16 w-10 items-center justify-center rounded-r-[1.15rem] border border-l-0 transition-all duration-300',
                  active
                    ? 'translate-x-0 border-sky-200/60 bg-[linear-gradient(90deg,rgba(125,190,255,.18),rgba(125,190,255,.08))] shadow-[0_0_18px_rgba(125,190,255,.25)]'
                    : 'translate-x-[-2px] border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,.06),rgba(255,255,255,.02))] hover:border-white/18 hover:bg-[linear-gradient(90deg,rgba(255,255,255,.09),rgba(255,255,255,.04))]'
                )}
              >
                <span className="sr-only">{index + 1}. {tab.label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'block h-7 w-1.5 rounded-full transition-all',
                    active ? 'bg-sky-200 shadow-[0_0_10px_rgba(125,190,255,.58)]' : 'bg-white/36 group-hover:bg-white/56'
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
