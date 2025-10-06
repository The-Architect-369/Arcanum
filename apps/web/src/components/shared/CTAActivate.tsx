'use client';

import { useRouter } from 'next/navigation';
import * as AccountState from '@/state/useAccount';

export default function CTAActivate({ className = '' }: { className?: string }) {
  const router = useRouter();

  // Soft call – if your store exposes setShowOnboarding, we toggle it.
  const openOnboarding = () => {
    try {
      // @ts-ignore
      if (typeof AccountState.setShowOnboarding === 'function') {
        // @ts-ignore
        AccountState.setShowOnboarding(true);
      }
    } catch { /* noop */ }
  };

  return (
    <button
      onClick={() => { openOnboarding(); router.push('/account'); }}
      className={`rounded-xl border border-white/20 bg-gradient-to-b from-white/15 to-white/5 px-4 py-2 text-sm font-medium hover:from-white/25 hover:to-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${className}`}
      title="Activate your Arcanum Chain Code — $1"
    >
      Activate Chain Code — $1
    </button>
  );
}
