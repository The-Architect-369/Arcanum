'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

// Soft-couple to your store — works even if some selectors aren’t present.
import * as AccountState from '@/state/useAccount';

type ACCOnboardingModalProps = {
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  className?: string;
};

function safeGetter<T>(fn: (() => T) | undefined, fallback: T): T {
  try { return fn ? fn() as T : fallback; } catch { return fallback; }
}
function safeAction<T extends any[]>(fn: ((...a: T) => any) | undefined) {
  return (...a: T) => { try { return fn?.(...a); } catch { /* noop */ } };
}

export default function ACCOnboardingModal({ open, onOpenChange, className = '' }: ACCOnboardingModalProps) {
  // Optional store API — if missing, we fall back to local state.
  // Expected (optional):
  //   getShowOnboarding(): boolean
  //   setShowOnboarding(v: boolean): void
  //   isTrusted(): boolean
  //   beginOnboarding(): void | Promise<void>
  //   completeOnboarding(): void | Promise<void>
  //   cancelOnboarding(): void

  // @ts-ignore
  const getShow = typeof AccountState.getShowOnboarding === 'function' ? AccountState.getShowOnboarding : undefined;
  // @ts-ignore
  const setShow = typeof AccountState.setShowOnboarding === 'function' ? AccountState.setShowOnboarding : undefined;
  // @ts-ignore
  const isTrusted = typeof AccountState.isTrusted === 'function' ? AccountState.isTrusted : undefined;
  // @ts-ignore
  const begin = typeof AccountState.beginOnboarding === 'function' ? AccountState.beginOnboarding : undefined;
  // @ts-ignore
  const complete = typeof AccountState.completeOnboarding === 'function' ? AccountState.completeOnboarding : undefined;
  // @ts-ignore
  const cancel = typeof AccountState.cancelOnboarding === 'function' ? AccountState.cancelOnboarding : undefined;

  const [mounted, setMounted] = React.useState(false);
  const [localOpen, setLocalOpen] = React.useState(false);

  const storeOpen = safeGetter<boolean>(getShow, false);
  const trusted = safeGetter<boolean>(isTrusted, false);

  const isOpen = open ?? storeOpen ?? localOpen;

  const setOpen = (v: boolean) => {
    try { setShow?.(v); } catch {}
    setLocalOpen(v);
    onOpenChange?.(v);
  };

  const doBegin = safeAction(begin);
  const doComplete = safeAction(complete);
  const doCancel = safeAction(cancel);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[100] flex items-center justify-center ${className}`} role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close" onClick={() => setOpen(false)} />
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-white/15 bg-[rgba(24,24,35,0.95)] p-5 shadow-[0_0_40px_rgba(80,120,255,0.25)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{trusted ? 'You’re all set' : 'Activate your Arcanum Chain Code'}</h2>
          <button onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-white/10">Close</button>
        </div>

        {!trusted ? (
          <div className="space-y-4 text-sm text-zinc-300">
            <p>
              Your <strong>ACC</strong> is a privacy-preserving identity that unlocks the full Arcanum.
              We’ll set up a smart wallet, mint your ACC (soul-bound), and issue starter MANA.
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Choose passkey (no passwords)</li>
              <li>Issue smart wallet (ERC-4337)</li>
              <li>Mint ACC</li>
              <li>Receive starter MANA</li>
            </ol>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => { doBegin(); setOpen(true); }}
                className="rounded-xl border border-white/20 bg-gradient-to-b from-white/15 to-white/5 px-4 py-2 text-sm font-medium hover:from-white/25 hover:to-white/10"
              >
                Begin ($1)
              </button>
              <button
                onClick={() => { doCancel(); setOpen(false); }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                Not now
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-zinc-300">
            <p>ACC detected. Finish optional perks:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Link socials to Chain Code</li>
              <li>Choose avatar & aura</li>
              <li>Enable notifications</li>
            </ul>
            <div className="pt-2">
              <button
                onClick={async () => { await doComplete(); setOpen(false); }}
                className="rounded-xl border border-white/20 bg-gradient-to-b from-white/15 to-white/5 px-4 py-2 text-sm font-medium hover:from-white/25 hover:to-white/10"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
