'use client';

import * as React from 'react';
import { cn } from "@/lib/cn";

type PanelShellProps = {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  contentClassName?: string;
  className?: string;
  flush?: boolean;
  noPadding?: boolean;
  children: React.ReactNode;
};

export default function PanelShell({
  title,
  actions,
  contentClassName,
  className,
  flush = false,
  noPadding = false,
  children,
}: PanelShellProps) {
  return (
    <div
      className={cn(
        flush ? 'px-0 my-0' : 'px-3 my-4',
        'mx-auto max-w-5xl min-h-0',
        className
      )}
    >
      <div className="relative h-full min-h-0 rounded-3xl bg-[linear-gradient(135deg,rgba(80,130,255,.45),rgba(246,196,83,.35))] p-[1px] shadow-[0_0_30px_rgba(120,180,255,0.15)]">
        <div
          className={cn(
            'tile-3d',
            'flex h-full min-h-0 flex-col',
            'rounded-[calc(theme(borderRadius.3xl)-1px)] border border-white/7.5',
            'bg-[rgba(10,10,16,0.85)] backdrop-blur-md',
            'shadow-[0_12px_40px_rgba(0,0,0,0.55),inset_0_0_40px_rgba(40,80,160,0.08)]'
          )}
        >
          {(title || actions) && (
            <div
              className={cn(
                'shrink-0 flex items-center gap-3 border-b border-white/10',
                noPadding ? 'px-0 py-0' : 'px-4 sm:px-6 py-3'
              )}
            >
              <div className="min-w-0 flex-1">
                {typeof title === 'string' ? (
                  <h2 className="truncate text-base font-semibold text-zinc-100 sm:text-lg">
                    {title}
                  </h2>
                ) : (
                  title
                )}
              </div>
              {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
            </div>
          )}

          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto scrollbar-none',
              noPadding ? '' : 'p-4 sm:p-6',
              contentClassName
            )}
          >
            {children}
          </div>
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
