"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import CurrentPanel from "./CurrentPanel";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
const key = "arcanum.current.install-invite.v1";
const Install = createContext<{
  installed: boolean;
  ready: boolean;
  eligible: boolean;
  busy: boolean;
  dismissed: boolean;
  action: (fallback?: () => void) => void;
  dismiss: () => void;
} | null>(null);
export const useCurrentInstall = () => useContext(Install);
export function CurrentInstallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [installed, setInstalled] = useState(false),
    [ready, setReady] = useState(false),
    [dismissed, setDismissed] = useState(true),
    [eligible, setEligible] = useState(false),
    [busy, setBusy] = useState(false),
    [instructions, setInstructions] = useState(false);
  const prompt = useRef<InstallEvent | null>(null);
  const inFlight = useRef(false);
  useEffect(() => {
    const display = matchMedia("(display-mode: standalone)");
    const detect = () =>
      setInstalled(
        display.matches ||
          (navigator as Navigator & { standalone?: boolean }).standalone ===
            true,
      );
    detect();
    display.addEventListener("change", detect);
    try {
      setDismissed(localStorage.getItem(key) === "dismissed");
    } catch {
      setDismissed(false);
    }
    setReady(true);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      prompt.current = event as InstallEvent;
      setEligible(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      prompt.current = null;
      setEligible(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if ("serviceWorker" in navigator && window.isSecureContext)
      navigator.serviceWorker
        .register("/updates-sw.js", { scope: "/updates" })
        .then((registration) => registration.update())
        .catch(() => {
          /* Reading and install instructions stay available when offline setup fails. */
        });
    return () => {
      display.removeEventListener("change", detect);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(key, "dismissed");
    } catch {
      /* This visit stays dismissed when browser storage is unavailable. */
    }
  };
  const action = async (fallback?: () => void) => {
    if (inFlight.current || installed) return;
    const event = prompt.current;
    if (!event) {
      if (fallback) fallback();
      else setInstructions(true);
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      await event.prompt();
      await event.userChoice;
    } catch {
      if (fallback) fallback();
      else setInstructions(true);
    } finally {
      prompt.current = null;
      setEligible(false);
      inFlight.current = false;
      setBusy(false);
    }
  };
  return (
    <Install.Provider
      value={{ installed, ready, dismissed, eligible, busy, action, dismiss }}
    >
      {children}
      {instructions && (
        <CurrentPanel
          title="Add Arcanum Current"
          label="Stay current"
          onClose={() => setInstructions(false)}
        >
          <p className="updates-panel-lead">
            Keep this public development window close, on your phone or
            computer.
          </p>
          <InstallInstructions />
        </CurrentPanel>
      )}
    </Install.Provider>
  );
}
export function InstallInstructions() {
  return (
    <>
      <div className="current-project">
        <h3>On Android</h3>
        <p>
          In a supporting browser such as Chrome, open the browser menu and look
          for Install app or Add to Home screen. If no install option is
          offered, keep reading in your browser.
        </p>
      </div>
      <div className="current-project">
        <h3>On iPhone or iPad</h3>
        <p>
          In Safari, open Share and choose Add to Home Screen where offered,
          then follow the browser’s choices.
        </p>
      </div>
      <div className="current-project">
        <h3>On a computer</h3>
        <p>
          In Chrome or Edge, look for the install option in the address bar or
          browser menu. In a supporting Safari on Mac, choose File → Add to
          Dock. Availability depends on your browser and system.
        </p>
      </div>
      <p>
        <a href="https://support.google.com/chrome/answer/9658361">
          Chrome installation help ↗
        </a>{" "}
        · <a href="https://support.apple.com/104996">Safari on Mac help ↗</a>
      </p>
      <p>
        Installation stays on this website’s origin. This protected preview is
        separate from the public site; a preview installation does not migrate
        automatically. Existing installed names may refresh later or need
        reinstalling.
      </p>
      <p>
        No login is required by Current to read or install. Hosting protection
        still applies to this preview. This adds convenient access; it does not
        enable alerts or install native Arcanum.
      </p>
    </>
  );
}
export function CurrentArrival() {
  const install = useCurrentInstall();
  if (!install?.ready || install.installed || install.dismissed) return null;
  return (
    <aside className="current-install-invite" aria-label="Add Arcanum Current">
      <div>
        <strong>Stay current.</strong>
        <p>Add Arcanum Current to your device.</p>
        <button
          type="button"
          className="current-action"
          disabled={install.busy}
          onClick={() => install.action()}
        >
          {install.busy ? "Opening install…" : "Add Arcanum Current"}
        </button>
      </div>
      <button
        type="button"
        aria-label="Dismiss installation invitation"
        onClick={install.dismiss}
      >
        <X size={20} aria-hidden="true" />
      </button>
    </aside>
  );
}
