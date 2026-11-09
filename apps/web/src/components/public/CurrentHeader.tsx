"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useCurrentNavigation } from "./CurrentExperience";
export default function CurrentHeader() {
  const path = usePathname();
  const params = useSearchParams();
  const navigation = useCurrentNavigation();
  const home = path === "/updates" || path === "/";
  const requested = params.get("view");
  const view =
    navigation?.view ??
    (requested === "available" || requested === "next" ? requested : "updates");
  const title =
    view === "available"
      ? "Find your starting point."
      : view === "next"
        ? "See what’s taking shape."
        : "Watch it take shape.";
  const subtitle =
    view === "available"
      ? "Explore what you can use today."
      : view === "next"
        ? "Follow the work across Arcanum."
        : "Follow the developing ARCnet.";
  return (
    <header className="current-header">
      <a
        className="current-lockup"
        href="/updates"
        aria-label="Arcanum Current — newest updates"
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
            return;
          if (navigation) {
            event.preventDefault();
            navigation.navigate("updates", true);
            if (view !== "updates")
              requestAnimationFrame(() =>
                window.dispatchEvent(new Event("arcanum:updates-top")),
              );
          } else if (home && view === "updates") {
            event.preventDefault();
            window.dispatchEvent(new Event("arcanum:updates-top"));
          }
        }}
      >
        <img src="/logo-arcanum.svg" width="36" height="36" alt="" />
        <span>
          <strong>Arcanum</strong>
          <small>The Current</small>
        </span>
      </a>
      {home && (
        <div className="current-section-title">
          <h1
            id={
              view === "available"
                ? "available-heading"
                : view === "next"
                  ? "development-roadmap"
                  : "development-feed"
            }
          >
            {title}
          </h1>
          <p>{subtitle}</p>
        </div>
      )}
    </header>
  );
}
