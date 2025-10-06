'use client';

import * as React from 'react';

type Props = {
  count?: number | null;
  max?: number;
  showZero?: boolean;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

// tiny local helper so we don't depend on a cn util
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default function BadgeCounter({
  count = 0,
  max = 99,
  showZero = false,
  className,
  children,
  ariaLabel = 'notifications',
}: Props) {
  const show = showZero ? true : (count ?? 0) > 0;
  const text =
    typeof count === 'number' && count > max ? `${max}+` : String(count ?? 0);

  return (
    <div className={cx('relative inline-flex', className)}>
      {children}
      {show && (
        <span
          aria-label={ariaLabel}
          className="absolute -right-1 -top-1 min-w-[18px] rounded-full border border-zinc-950 bg-amber-400 px-1 text-center text-[10px] font-semibold leading-[18px] text-zinc-950 shadow-[0_0_10px_rgba(255,200,80,0.45)]"
        >
          {showZero ? '' : text}
        </span>
      )}
    </div>
  );
}
