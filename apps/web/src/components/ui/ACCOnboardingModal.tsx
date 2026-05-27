"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import * as AccountState from "@/state/useAccount";

type ACCOnboardingModalProps = {
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  className?: string;
};

function safeGetter<T>(fn: (() => T) | undefined, fallback: T): T {
  try {
    return fn ? (fn() as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeAction<T extends any[]>(fn: ((...args: T) => any) | undefined) {
  return (...args: T) => {
    try {
      return fn?.(...args);
    } catch {
      return undefined;
    }
  };
}

export default function ACCOnboardingModal({
  open,
  onOpenChange,
  className = "",
}: ACCOnboardingModalProps) {
  const getShow =
    typeof AccountState.getShowOnboarding === "function"
      ? AccountState.getShowOnboarding
      : undefined;
  const setShow =
    typeof AccountState.setShowOnboarding === "function"
      ? AccountState.setShowOnboarding
      : undefined;
  const isTrusted =
    typeof AccountState.isTrusted === "function" ? AccountState.isTrusted : undefined;
  const begin =
    typeof AccountState.beginOnboarding === "function"
      ? AccountState.beginOnboarding
      : undefined;
  const complete =
    typeof AccountState.completeOnboarding === "function"
      ? AccountState.completeOnboarding
      : undefined;
  const cancel =
    typeof AccountState.cancelOnboarding === "function"
      ? AccountState.cancelOnboarding
      : undefined;

  const [mounted, setMounted] = React.useState(false);
  const [localOpen, setLocalOpen] = React.useState(false);

  const storeOpen = safeGetter<boolean>(getShow, false);
  const trusted = safeGetter<boolean>(isTrusted, false);
  const isOpen = open ?? storeOpen ?? localOpen;

  const setOpen = (next: boolean) => {
    try {
      setShow?.(next);
    } catch {
      // ignore
    }
    setLocalOpen(next);
    onOpenChange?.(next);
  };

  const doBegin = safeAction(begin);
  const doComplete = safeAction(complete);
  const doCancel = safeAction(cancel);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center ${className}`}
      role="dialog"
      aria-modal="true"
    >
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={() => setOpen(false)}
      />
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-white/15 bg-[rgba(24,24,35,0.95)] p-5 shadow-[0_0_40px_rgba(80,120,255,0.25)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {trusted ? "You’re all set" : "Activate your Arcanum identity"}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        {!trusted ? (
          <div className="space-y-4 text-sm text-zinc-300">
            <p>
              Activation creates a mobile-safe identity session on this device. Chain settlement is
              optional and can be bound later from onboarding or wallet surfaces.
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Choose passkey or burner</li>
              <li>Store mobile session state safely</li>
              <li>Optionally bind an ARCnet address later</li>
            </ol>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  doBegin();
                  setOpen(true);
                }}
                className="rounded-xl border border-white/20 bg-gradient-to-b from-white/15 to-white/5 px-4 py-2 text-sm font-medium hover:from-white/25 hover:to-white/10"
              >
                Begin
              </button>
              <button
                onClick={() => {
                  doCancel();
                  setOpen(false);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                Not now
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-zinc-300">
            <p>Identity is active on this device.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Review wallet balance and sync status</li>
              <li>Inspect stored artifacts in Vault</li>
              <li>Adjust diagnostics and local cache in Preferences</li>
            </ul>
            <div className="pt-2">
              <button
                onClick={async () => {
                  await doComplete();
                  setOpen(false);
                }}
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
