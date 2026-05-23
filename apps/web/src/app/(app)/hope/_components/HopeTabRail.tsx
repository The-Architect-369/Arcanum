'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

type HopeTab = {
  href: string;
  label: string;
};

export default function HopeTabRail({ tabs }: { tabs: readonly HopeTab[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Hope navigation" className="flex w-full justify-center">
      <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-sm">
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
                'relative h-3 rounded-full transition-all duration-300 ease-out',
                active
                  ? 'w-8 bg-amber-300 shadow-[0_0_10px_rgba(246,196,83,0.85)]'
                  : 'w-3 bg-white/25 hover:bg-white/45'
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
