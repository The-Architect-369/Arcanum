'use client';

import { cn } from '@/lib/cn'

export type TabKey = string;

export default function TabMenuIndicators({
  keys,
  active,
  onSelect,
}: {
  keys: TabKey[];
  active: TabKey;
  onSelect: (k: TabKey) => void;
}) {
  return (
    <div className="sticky top-14 z-30 bg-transparent">
      {/* Center the row */}
      <div className="mx-auto max-w-5xl px-3 h-14 flex items-end justify-center gap-3">
        {keys.map((k) => {
          const isActive = k === active;
          return (
            <button
              key={k}
              onClick={() => onSelect(k)}
              className={cn(
                'relative h-8 px-4 rounded-[6px] border transition-none',
                isActive
                  ? 'bg-blue-700 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(246,196,83,0.8)] scale-110'
                  : 'bg-neutral-900/60 text-zinc-400 border-zinc-500'
              )}
              aria-current={isActive ? 'true' : 'false'}
            >
              <span className="text-[12px] capitalize tracking-wide">{k}</span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-10 bg-amber-400 shadow-[0_0_8px_rgba(246,196,83,0.7)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
