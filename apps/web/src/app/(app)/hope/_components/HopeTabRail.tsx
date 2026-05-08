'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

type HopeTab = {
  href: string;
  label: string;
};

export default function HopeTabRail({ tabs }: { tabs: readonly HopeTab[] }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="px-3 pb-3 pt-2">
      <div className="mx-auto flex w-full max-w-4xl justify-start">
        <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur-sm">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <button
                key={tab.href}
                type="button"
                onClick={() => router.replace(tab.href)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-xl border px-3 py-2 text-xs uppercase tracking-wide transition-all',
                  active
                    ? 'border-amber-400 bg-blue-700 text-amber-300 shadow-[0_0_12px_rgba(246,196,83,0.35)]'
                    : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
