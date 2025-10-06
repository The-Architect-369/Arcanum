'use client';

export function LockHint({ label = 'Requires ACC' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/80">
      🔒 {label}
    </span>
  );
}
