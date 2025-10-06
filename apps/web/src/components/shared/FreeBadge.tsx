'use client';

export default function FreeBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/90">
      <span>Free</span>
      <span className="opacity-70">read-only</span>
    </span>
  );
}
