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
  const headerActions = (
    <div className="flex items-center gap-2 sm:gap-3">
      <nav aria-label="Horizontal card navigation" className="flex items-end gap-1.5 sm:gap-2">
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
                'relative block h-7 w-5 rounded-t-xl border border-b-0 transition-all duration-300 sm:h-8 sm:w-6',
                active
                  ? 'translate-y-px border-amber-200/70 bg-amber-200/18 shadow-[0_0_14px_rgba(246,196,83,.25)]'
                  : 'border-white/12 bg-white/[0.06] hover:border-white/22 hover:bg-white/[0.10]'
              )}
            >
              <span className="sr-only">{index + 1}. {tab.label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-1/2 top-1/2 h-3.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all sm:h-4',
                  active ? 'bg-amber-100 shadow-[0_0_10px_rgba(246,196,83,.55)]' : 'bg-white/38'
                )}
              />
            </Link>
          );
        })}
      </nav>
      {actions ? <div className="hidden text-xs text-zinc-400 sm:block">{actions}</div> : null}
    </div>
  );

  return (
    <div className={cn('relative h-full min-h-0', className)}>
      <PanelShell
        title={title}
        actions={headerActions}
        flush
        className="min-h-0 flex-1"
        contentClassName={cn('px-12 sm:px-10', contentClassName)}
      >
        {children}
      </PanelShell>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-2 sm:pl-3">
        <nav aria-label="Vertical card navigation" className="pointer-events-auto flex flex-col gap-3">
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
                  'group relative flex h-12 w-8 items-center justify-center rounded-r-2xl border transition-all duration-300',
                  active
                    ? 'border-sky-200/55 bg-sky-300/18 shadow-[0_0_18px_rgba(125,190,255,.28)]'
                    : 'border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.06]'
                )}
              >
                <span className="sr-only">{index + 1}. {tab.label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'block h-6 w-1.5 rounded-full transition-all',
                    active ? 'bg-sky-200 shadow-[0_0_10px_rgba(125,190,255,.6)]' : 'bg-white/40 group-hover:bg-white/65'
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
