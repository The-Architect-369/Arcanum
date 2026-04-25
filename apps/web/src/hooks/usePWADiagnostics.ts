"use client";

import { useCallback, useEffect, useState } from "react";

export type PWADisplayMode =
  | "browser"
  | "standalone"
  | "minimal-ui"
  | "fullscreen"
  | "window-controls-overlay"
  | "ios-standalone"
  | "unknown";

export type PWADiagnostics = {
  generatedAt: string;
  href: string;
  referrer: string;
  secureContext: boolean;
  online: boolean;
  visibilityState: DocumentVisibilityState;
  userAgent: string;
  manifestHref: string | null;
  displayMode: PWADisplayMode;
  standalone: boolean;
  iosStandalone: boolean;
  serviceWorkerSupported: boolean;
  serviceWorkerController: boolean;
  serviceWorkerControllerScriptURL: string | null;
  serviceWorkerRegistrationCount: number;
  serviceWorkerRegistrationScopes: string[];
  beforeInstallPromptSeenThisView: boolean;
  appInstalledSeenThisView: boolean;
};

function getDisplayMode(): PWADisplayMode {
  if (typeof window === "undefined") return "unknown";

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  if (window.matchMedia?.("(display-mode: window-controls-overlay)").matches) {
    return "window-controls-overlay";
  }
  if (window.matchMedia?.("(display-mode: fullscreen)").matches) {
    return "fullscreen";
  }
  if (window.matchMedia?.("(display-mode: standalone)").matches) {
    return "standalone";
  }
  if (window.matchMedia?.("(display-mode: minimal-ui)").matches) {
    return "minimal-ui";
  }
  if (navigatorWithStandalone.standalone === true) {
    return "ios-standalone";
  }

  return "browser";
}

function makeEmptyDiagnostics(): PWADiagnostics {
  return {
    generatedAt: new Date(0).toISOString(),
    href: "",
    referrer: "",
    secureContext: false,
    online: true,
    visibilityState: "visible",
    userAgent: "",
    manifestHref: null,
    displayMode: "unknown",
    standalone: false,
    iosStandalone: false,
    serviceWorkerSupported: false,
    serviceWorkerController: false,
    serviceWorkerControllerScriptURL: null,
    serviceWorkerRegistrationCount: 0,
    serviceWorkerRegistrationScopes: [],
    beforeInstallPromptSeenThisView: false,
    appInstalledSeenThisView: false,
  };
}

export function usePWADiagnostics() {
  const [data, setData] = useState<PWADiagnostics>(makeEmptyDiagnostics());
  const [loading, setLoading] = useState(true);
  const [beforeInstallPromptSeenThisView, setBeforeInstallPromptSeenThisView] =
    useState(false);
  const [appInstalledSeenThisView, setAppInstalledSeenThisView] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = () => setBeforeInstallPromptSeenThisView(true);
    const onAppInstalled = () => setAppInstalledSeenThisView(true);
    const onVisibilityChange = () => setRefreshTick((value) => value + 1);
    const onOnline = () => setRefreshTick((value) => value + 1);
    const onOffline = () => setRefreshTick((value) => value + 1);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", onAppInstalled);
    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function collect() {
      setLoading(true);

      const serviceWorkerSupported = "serviceWorker" in navigator;
      let registrationScopes: string[] = [];

      if (serviceWorkerSupported) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          registrationScopes = registrations.map((registration) => registration.scope);
        } catch {
          registrationScopes = [];
        }
      }

      const manifestHref =
        document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href ?? null;

      const controller = serviceWorkerSupported
        ? navigator.serviceWorker.controller
        : null;

      const navigatorWithStandalone = navigator as Navigator & {
        standalone?: boolean;
      };

      const displayMode = getDisplayMode();
      const iosStandalone = navigatorWithStandalone.standalone === true;
      const standalone =
        iosStandalone ||
        displayMode === "standalone" ||
        displayMode === "fullscreen" ||
        displayMode === "minimal-ui" ||
        displayMode === "window-controls-overlay";

      if (cancelled) return;

      setData({
        generatedAt: new Date().toISOString(),
        href: window.location.href,
        referrer: document.referrer,
        secureContext: window.isSecureContext,
        online: navigator.onLine,
        visibilityState: document.visibilityState,
        userAgent: navigator.userAgent,
        manifestHref,
        displayMode,
        standalone,
        iosStandalone,
        serviceWorkerSupported,
        serviceWorkerController: !!controller,
        serviceWorkerControllerScriptURL: controller?.scriptURL ?? null,
        serviceWorkerRegistrationCount: registrationScopes.length,
        serviceWorkerRegistrationScopes: registrationScopes,
        beforeInstallPromptSeenThisView,
        appInstalledSeenThisView,
      });

      setLoading(false);
    }

    void collect();

    return () => {
      cancelled = true;
    };
  }, [appInstalledSeenThisView, beforeInstallPromptSeenThisView, refreshTick]);

  return { data, loading, refresh };
}
