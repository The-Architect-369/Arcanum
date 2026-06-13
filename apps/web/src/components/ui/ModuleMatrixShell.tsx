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
  return (
    <div className={cn('relative h-full min-h-0', className)}>
      <PanelShell
        title={title}
        actions={actions}
        flush
        className="min-h-0 flex-1"
        contentClassName={cn('px-12 sm:px-14', contentClassName)}
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

      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center pr-1.5 sm:pr-2.5">
        <nav aria-label="Horizontal card navigation" className="pointer-events-auto flex flex-col gap-2">
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
                  'relative flex min-h-[2.7rem] w-10 items-center justify-center rounded-l-2xl border px-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-300',
                  active
                    ? 'border-amber-200/60 bg-amber-200/18 text-amber-100 shadow-[0_0_18px_rgba(246,196,83,.28)]'
                    : 'border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-200'
                )}
              >
                <span className="sr-only">{index + 1}. {tab.label}</span>
                <span aria-hidden="true" className="[writing-mode:vertical-rl] [text-orientation:mixed]">
                  {tab.shortLabel ?? tab.label.slice(0, 4)}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
