"use client";
import { useState } from "react";
import { InstallInstructions, useCurrentInstall } from "./CurrentInstall";
export default function UpdatesInstall() {
  const install = useCurrentInstall();
  const [instructions, setInstructions] = useState(false);
  return (
    <aside className="updates-install" aria-label="Current app installation">
      {install?.installed ? (
        <p>Current is running in an installed window.</p>
      ) : (
        <button
          type="button"
          className="current-action"
          disabled={!install?.ready || install.busy}
          onClick={() => install?.action(() => setInstructions(true))}
        >
          {install?.busy ? "Opening install…" : "Add Arcanum Current"}
        </button>
      )}
      {instructions && <InstallInstructions />}
      <p>
        Use Current on supported phones and computers. Browser installation is
        separate from native Arcanum and does not enable alerts.
      </p>
      <p className="updates-footnote">
        Saved offline pages may be older than the latest publication. Reconnect
        to check what’s new.
      </p>
    </aside>
  );
}
