"use client";

import { useEffect, useRef, useState } from "react";
import usePreference from "@/state/usePreference";
import { syncChainBalance, useAccount } from "@/state/useAccount";
import {
  hasDeferredInstallPrompt,
  promptToInstall,
  subscribeInstallPrompt,
} from "@/lib/mobile/installPrompt";

const AUTO_SYNC_MIN_INTERVAL_MS = 60_000;

export default function DeviceRuntime() {
  const account = useAccount();
  const [prefs] = usePreference();
  const [installAvailable, setInstallAvailable] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const syncingRef = useRef(false);
  const lastSyncRef = useRef(0);

  useEffect(() => {
    setInstallAvailable(hasDeferredInstallPrompt());
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);

    const unsubscribeInstall = subscribeInstallPrompt(setInstallAvailable);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onUpdateReady = () => setUpdateReady(true);
    const onAppInstalled = () => {
      setInstallAvailable(false);
      setMessage("App installed on this device.");
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("arcanum:pwa-update-ready", onUpdateReady as EventListener);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      unsubscribeInstall();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("arcanum:pwa-update-ready", onUpdateReady as EventListener);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!prefs.autoSyncWallet) return;
    if (!account.trusted || !account.chainAddress || !online) return;

    const maybeSync = async () => {
      const now = Date.now();
      if (syncingRef.current) return;
      if (now - lastSyncRef.current < AUTO_SYNC_MIN_INTERVAL_MS) return;
      syncingRef.current = true;
      try {
        const result = await syncChainBalance();
        if (result.ok) {
          lastSyncRef.current = now;
        }
      } finally {
        syncingRef.current = false;
      }
    };

    const onFocus = () => {
      void maybeSync();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void maybeSync();
      }
    };
    const onOnline = () => {
      void maybeSync();
    };

    void maybeSync();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [account.trusted, account.chainAddress, online, prefs.autoSyncWallet]);

  async function handleInstall() {
    const result = await promptToInstall();
    if (!result.available) {
      setMessage("Install prompt is not currently available in this browser view.");
      return;
    }
    setMessage(
      result.outcome === "accepted"
        ? "Install accepted. Finish the browser prompt to complete setup."
        : "Install prompt dismissed."
    );
  }

  async function handleUpdate() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      const onControllerChange = () => {
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange, {
        once: true,
      });
      return;
    }

    setMessage("No waiting update was found.");
    setUpdateReady(false);
  }

  if (online && !installAvailable && !updateReady && !message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--arcanum-footer-h)+10px)] z-[70] flex justify-center px-3">
      <div className="pointer-events-auto w-full max-w-xl rounded-2xl border border-white/10 bg-black/80 p-3 shadow-[0_12px_36px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="flex flex-col gap-2 text-sm text-zinc-200">
          {!online && (
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-amber-100">
              You are offline. Cached content remains available, but wallet sync and remote actions are unavailable.
            </div>
          )}

          {installAvailable && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div>
                <div className="font-medium text-zinc-100">Install available</div>
                <div className="text-xs text-zinc-400">Save ARCnet to your device home screen from this browser surface.</div>
              </div>
              <button
                onClick={() => {
                  void handleInstall();
                }}
                className="rounded-xl border border-amber-300/40 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-300/10"
              >
                Install app
              </button>
            </div>
          )}

          {updateReady && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div>
                <div className="font-medium text-zinc-100">Update ready</div>
                <div className="text-xs text-zinc-400">A newer cached shell is waiting. Reload once to apply it.</div>
              </div>
              <button
                onClick={() => {
                  void handleUpdate();
                }}
                className="rounded-xl border border-sky-300/40 px-3 py-1.5 text-xs text-sky-200 hover:bg-sky-300/10"
              >
                Apply update
              </button>
            </div>
          )}

          {message && <div className="text-xs text-zinc-400">{message}</div>}
        </div>
      </div>
    </div>
  );
}
