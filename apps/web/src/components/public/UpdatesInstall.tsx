"use client";
import { useEffect, useState } from "react";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export default function UpdatesInstall() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [offline, setOffline] = useState(false);
  const [workerFailed, setWorkerFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const onNetwork = () => setOffline(!navigator.onLine);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    onNetwork();
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onNetwork);
    window.addEventListener("offline", onNetwork);
    if ("serviceWorker" in navigator && window.isSecureContext) {
      navigator.serviceWorker
        .register("/updates-sw.js", { scope: "/updates" })
        .then((registration) => registration.update())
        .catch(() => {
          if (active) setWorkerFailed(true);
        });
    }
    return () => {
      active = false;
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onNetwork);
      window.removeEventListener("offline", onNetwork);
    };
  }, []);
  return (
    <aside className="updates-install" aria-label="Updates app installation">
      {offline && (
        <p role="status">
          Offline. Saved pages may be older than the latest published version.
        </p>
      )}
      {workerFailed && (
        <p role="status">
          Offline setup is unavailable. You can still browse online.
        </p>
      )}
      {!installed &&
        (prompt ? (
          <button
            className="public-button"
            onClick={async () => {
              try {
                await prompt.prompt();
                await prompt.userChoice;
              } finally {
                setPrompt(null);
              }
            }}
          >
            Install Arcanum Current
          </button>
        ) : (
          <details>
            <summary>Add Current to your phone</summary>
            <p>
              In your Android browser menu, choose “Install app” or “Add to Home
              screen” if offered. Installation stays on this website’s origin; a
              preview installation is separate from the final public app.
            </p>
          </details>
        ))}
      <p className="updates-footnote">
        Public development notes only. Saved offline copies can be out of date;
        reconnect to check for new posts.
      </p>
    </aside>
  );
}
