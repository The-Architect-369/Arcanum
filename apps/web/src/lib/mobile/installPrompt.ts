"use client";

export type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

type Listener = (available: boolean) => void;

let deferredPrompt: BeforeInstallPromptEventLike | null = null;
const listeners = new Set<Listener>();

function notify() {
  const available = Boolean(deferredPrompt);
  listeners.forEach((listener) => {
    try {
      listener(available);
    } catch {
      // ignore listener failures
    }
  });
}

export function setDeferredInstallPrompt(event: BeforeInstallPromptEventLike | null) {
  deferredPrompt = event;
  notify();
}

export function hasDeferredInstallPrompt() {
  return Boolean(deferredPrompt);
}

export function subscribeInstallPrompt(listener: Listener) {
  listeners.add(listener);
  listener(Boolean(deferredPrompt));
  return () => listeners.delete(listener);
}

export async function promptToInstall() {
  const prompt = deferredPrompt;
  if (!prompt) {
    return {
      available: false as const,
      outcome: null,
    };
  }

  await prompt.prompt();
  const choice = prompt.userChoice ? await prompt.userChoice : null;
  deferredPrompt = null;
  notify();

  return {
    available: true as const,
    outcome: choice?.outcome ?? null,
    platform: choice?.platform ?? null,
  };
}
