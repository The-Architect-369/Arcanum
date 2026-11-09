"use client";
import { usePathname, useSearchParams } from "next/navigation";
export default function CurrentHeader() {
  const path = usePathname();
  const params = useSearchParams();
  return (
    <header className="current-header">
      <a
        href="/updates"
        aria-label="Arcanum Current — newest updates"
        onClick={(event) => {
          const view = params.get("view");
          if (
            (path === "/updates" ||
              (path === "/" &&
                location.hostname === "updates.the-arcanum.net")) &&
            (!view || view === "updates" || view === "feed") &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey
          ) {
            event.preventDefault();
            window.dispatchEvent(new Event("arcanum:updates-top"));
          }
        }}
      >
        <img src="/logo-arcanum.svg" width="42" height="42" alt="" />
        <span>
          <strong>Arcanum Current</strong>
          <small>Follow the developing ARCnet.</small>
        </span>
      </a>
    </header>
  );
}
