"use client";
import ArcanumMark from "./ArcanumMark";
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
        <ArcanumMark /> <span className="current-companion">Current</span>
      </a>
    </header>
  );
}
