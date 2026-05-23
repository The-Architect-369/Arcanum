'use client';

import * as React from 'react';
import { cn } from "@/lib/cn";

type PanelShellProps = {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  contentClassName?: string;
  className?: string;
  flush?: boolean;
  noPadding?: boolean;
  children: React.ReactNode;
};

export default function PanelShell({
  title,
  actions,
  tabs,
  contentClassName,
  className,
  flush = false,
  noPadding = false,
  children,
}: PanelShellProps) {
  return (
    <div
      className={cn(
        flush ? 'px-2 py-2 sm:px-3 sm:py-3' : 'px-3 py-4',
        'mx-auto h-full min-h-0 w-full max-w-5xl flex-1',
        className
      )}
    >
      <div className="relative h-full min-h-0 rounded-[2rem] bg-[radial-gradient(circle_at_15%_10%,rgba(246,196,83,.75),transparent_20%),radial-gradient(circle_at_85%_18%,rgba(115,180,255,.7),transparent_22%),linear-gradient(135deg,rgba(246,196,83,.85),rgba(120,180,255,.55),rgba(180,100,255,.4))] p-[2px] shadow-[0_0_42px_rgba(120,180,255,0.24),0_0_26px_rgba(246,196,83,0.14)]">
        <div className="absolute inset-[2px] rounded-[calc(2rem-2px)] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.18)_0_1px,transparent_1.5px),radial-gradient(circle_at_70%_30%,rgba(246,196,83,.22)_0_1px,transparent_1.5px),radial-gradient(circle_at_35%_75%,rgba(115,180,255,.2)_0_1px,transparent_1.5px)] opacity-80" aria-hidden="true" />
        <div
          className={cn(
            'tile-3d relative z-10',
            'flex h-full min-h-0 flex-col overflow-hidden',
            'rounded-[calc(2rem-3px)] border border-white/10',
            'bg-[rgba(6,8,18,0.72)] backdrop-blur-xl',
            'shadow-[0_16px_48px_rgba(0,0,0,0.62),inset_0_0_55px_rgba(80,130,255,0.10),inset_0_0_20px_rgba(246,196,83,0.06)]'
          )}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[calc(2rem-3px)] bg-[linear-gradient(120deg,rgba(255,255,255,.16),transparent_24%,rgba(120,180,255,.08)_45%,transparent_62%,rgba(246,196,83,.12))] opacity-70" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" aria-hidden="true" />

          {(title || actions) && (
            <div
              className={cn(
                'relative z-10 shrink-0 flex items-center gap-3 border-b border-white/10 bg-black/10',
                noPadding ? 'px-0 py-0' : 'px-4 sm:px-6 py-3'
              )}
            >
              <div className="min-w-0 flex-1">
                {typeof title === 'string' ? (
                  <h2 className="truncate bg-gradient-to-r from-amber-200 via-zinc-100 to-sky-200 bg-clip-text text-base font-semibold tracking-wide text-transparent drop-shadow-[0_0_10px_rgba(246,196,83,0.25)] sm:text-lg">
                    {title}
                  </h2>
                ) : (
                  <div className="[&_h1]:bg-gradient-to-r [&_h1]:from-amber-200 [&_h1]:via-zinc-100 [&_h1]:to-sky-200 [&_h1]:bg-clip-text [&_h1]:tracking-wide [&_h1]:text-transparent [&_h1]:drop-shadow-[0_0_10px_rgba(246,196,83,0.25)]">
                    {title}
                  </div>
                )}
              </div>
              {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
            </div>
          )}

          <div
            className={cn(
              'relative z-10 min-h-0 flex-1 overflow-y-auto scrollbar-none',
              tabs ? 'pb-16' : '',
              noPadding ? '' : 'p-4 sm:p-6',
              contentClassName
            )}
          >
            {children}
          </div>

          {tabs && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4">
              <div className="pointer-events-auto rounded-full border border-white/10 bg-black/35 px-2 py-1.5 shadow-[0_0_18px_rgba(0,0,0,0.45)] backdrop-blur-md">
                {tabs}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PanelSection({
  title,
  children,
  className,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('mb-6 last:mb-0', className)}>
      {title && <div className="mb-2 text-sm font-semibold tracking-wide text-zinc-300">{title}</div>}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        {children}
      </div>
    </section>
  );
}
