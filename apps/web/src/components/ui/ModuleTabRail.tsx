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
      <div className="inline-flex items-center justify-center gap-2 px-1 py-0.5">
        {tabs.map((tab, index) => {
          const active = pathname === tab.href;
          return (
            <a
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              title={tab.label}
              className={cn(
                'relative h-2.5 rounded-full transition-all duration-300 ease-out',
                active
                  ? 'module-tab-active w-8 bg-amber-200/90 shadow-[0_0_10px_rgba(246,196,83,0.8)]'
                  : 'w-2.5 bg-white/30 hover:bg-white/55'
              )}
            >
              <span className="sr-only">{index + 1}. {tab.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
