"use client";

import { useEffect } from "react";
import {
  setDeferredInstallPrompt,
  type BeforeInstallPromptEventLike,
} from "@/lib/mobile/installPrompt";

function dispatchUpdateReady() {
  window.dispatchEvent(new CustomEvent("arcanum:pwa-update-ready"));
}

export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext && window.location.hostname !== "localhost") return;

    let registrationRef: ServiceWorkerRegistration | null = null;

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEventLike & { preventDefault?: () => void };
      promptEvent.preventDefault?.();
      setDeferredInstallPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
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
        .then((registration) => {
          watchRegistration(registration);
        })
        .catch((error) => console.warn("[pwa] service worker registration failed", error));
    };

    const refreshRegistration = () => {
      registrationRef?.update().catch(() => {
        // ignore periodic update checks
      });
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshRegistration();
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", refreshRegistration);
    document.addEventListener("visibilitychange", onVisible);

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
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
