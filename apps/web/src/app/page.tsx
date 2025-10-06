'use client';

import { useEffect, useState } from 'react';

declare global {
  interface WindowEventMap {
    beforeinstallprompt: any;
  }
}

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };

  // If landing sent ?install=1, auto show prompt when possible
  useEffect(() => {
    const wantsInstall = new URLSearchParams(window.location.search).get('install') === '1';
    if (wantsInstall && canInstall) triggerInstall();
  }, [canInstall]);

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">ARCnet</h1>
        <p className="mt-2 text-sm text-white/70">Mobile client preview</p>

        {canInstall ? (
          <button
            onClick={triggerInstall}
            className="mt-6 w-full rounded-xl bg-indigo-500/90 px-4 py-3 text-center font-medium hover:bg-indigo-500"
          >
            Install App
          </button>
        ) : (
          <div className="mt-6 rounded-xl border border-white/10 p-4 text-sm text-white/70">
            On iOS: Share ▸ Add to Home Screen<br />
            On Android: ⋮ ▸ Add to Home screen
          </div>
        )}
      </div>
    </main>
  );
}
