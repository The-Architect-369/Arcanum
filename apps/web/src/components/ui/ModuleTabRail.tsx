'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

type ModuleTab = {
  href: string;
  label: string;
};

type ModuleTabRailProps = {
  tabs: readonly ModuleTab[];
};

export default function ModuleTabRail({ tabs }: ModuleTabRailProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Module navigation" className="flex w-full justify-center">
      <div className="inline-flex max-w-full flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur-sm">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <a
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative rounded-xl border px-3 pb-3 pt-2 text-xs uppercase tracking-wide transition-all',
                active
                  ? 'border-amber-400 bg-blue-700 text-amber-300 shadow-[0_0_12px_rgba(246,196,83,0.35)]'
                  : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10'
              )}
            >
              <span>{tab.label}</span>
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(246,196,83,0.75)]"
                />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
