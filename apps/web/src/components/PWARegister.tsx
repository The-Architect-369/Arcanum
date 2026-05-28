"use client";

import { useEffect } from "react";
import {
  setDeferredInstallPrompt,
  type BeforeInstallPromptEventLike,
} from "@/lib/mobile/installPrompt";

const CONTROL_RECOVERY_KEY = "arcanum:pwa-control-recovery";

function dispatchUpdateReady() {
  window.dispatchEvent(new CustomEvent("arcanum:pwa-update-ready"));
}

function isStandaloneSurface() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: fullscreen)").matches ||
    window.matchMedia?.("(display-mode: minimal-ui)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function getRecoveryKey(scope: string) {
  return `${CONTROL_RECOVERY_KEY}:${scope}`;
}

export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext && window.location.hostname !== "localhost") return;

    let registrationRef: ServiceWorkerRegistration | null = null;

    const clearRecoveryFlag = (scope?: string | null) => {
      if (!scope) return;
      try {
        window.sessionStorage.removeItem(getRecoveryKey(scope));
      } catch {
        // ignore session storage failures
      }
    };

    const ensureStandaloneController = async (registration?: ServiceWorkerRegistration | null) => {
      try {
        const activeRegistration = registration ?? registrationRef ?? (await navigator.serviceWorker.getRegistration());
        if (!activeRegistration) return;

        if (navigator.serviceWorker.controller) {
          clearRecoveryFlag(activeRegistration.scope);
          return;
        }

        if (!isStandaloneSurface()) {
          return;
        }

        const key = getRecoveryKey(activeRegistration.scope);
        const alreadyRetried = window.sessionStorage.getItem(key) === "1";
        if (alreadyRetried) {
          return;
        }

        window.sessionStorage.setItem(key, "1");
        window.setTimeout(() => {
          window.location.reload();
        }, 250);
      } catch {
        // ignore control recovery failures
      }
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEventLike & { preventDefault?: () => void };
      promptEvent.preventDefault?.();
      setDeferredInstallPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      void ensureStandaloneController(registrationRef);
    };

    const watchRegistration = (registration: ServiceWorkerRegistration) => {
      registrationRef = registration;
      if (registration.waiting) {
        dispatchUpdateReady();
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            dispatchUpdateReady();
          }
        });
      });
    };

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(async (registration) => {
          watchRegistration(registration);
          await navigator.serviceWorker.ready;
          await ensureStandaloneController(registration);
        })
        .catch((error) => console.warn("[pwa] service worker registration failed", error));
    };

    const refreshRegistration = () => {
      registrationRef?.update().catch(() => {
        // ignore periodic update checks
      });
      void ensureStandaloneController(registrationRef);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshRegistration();
      }
    };

    const onControllerChange = () => {
      clearRecoveryFlag(registrationRef?.scope ?? null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", refreshRegistration);
    document.addEventListener("visibilitychange", onVisible);
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", refreshRegistration);
      document.removeEventListener("visibilitychange", onVisible);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
