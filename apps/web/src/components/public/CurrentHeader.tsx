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
        <img src="/current-icons/native-symbol.svg" width="32" height="32" alt="" />
        <strong>Arcanum Current</strong>
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
        </div>
      )}
    </header>
  );
}
