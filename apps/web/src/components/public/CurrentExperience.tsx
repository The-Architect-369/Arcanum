"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
export type CurrentView = "updates" | "available" | "next";
const order: CurrentView[] = ["updates", "available", "next"];
const Navigation = createContext<{
  view: CurrentView;
  navigate: (view: CurrentView, retap?: boolean) => void;
} | null>(null);
export const useCurrentNavigation = () => useContext(Navigation);
export default function CurrentExperience({
  initialView,
  children,
}: {
  initialView: CurrentView;
  children: React.ReactNode;
}) {
  const [view, setView] = useState(initialView);
  const current = useRef(view);
  const positions = useRef<Record<CurrentView, number>>({
    updates: 0,
    available: 0,
    next: 0,
  });
  const select = useCallback((next: CurrentView) => {
    const main = document.querySelector<HTMLElement>("#public-main");
    positions.current[current.current] = main?.scrollTop ?? 0;
    current.current = next;
    setView(next);
  }, []);
  const navigate = useCallback(
    (next: CurrentView, retap = false) => {
      if (document.querySelector("dialog[open]")) return;
      if (current.current === next) {
        if (retap && next === "updates")
          window.dispatchEvent(new Event("arcanum:updates-top"));
        return;
      }
      history.pushState({ ...history.state }, "", `/updates?view=${next}`);
      select(next);
    },
    [select],
  );
  useLayoutEffect(() => {
    document
      .querySelector("#public-main")
      ?.scrollTo({ top: positions.current[view], behavior: "instant" });
  }, [view]);
  useEffect(() => {
    const back = () => {
      const candidate = new URL(location.href).searchParams.get("view");
      const next =
        candidate === "available" || candidate === "next"
          ? candidate
          : "updates";
      if (next !== current.current) select(next);
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, [select]);
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("#public-main");
    if (!main) return;
    let start: { x: number; y: number; id: number } | null = null;
    let suppressClickUntil = 0;
    const excluded = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return true;
      const control = target.closest(
        'input,select,textarea,summary,[contenteditable="true"],button,a,[data-no-tab-swipe]',
      );
      return Boolean(control && !control.matches(".updates-row,.current-card"));
    };
    const down = (event: PointerEvent) => {
      start = null;
      if (
        event.pointerType !== "touch" ||
        !event.isPrimary ||
        event.clientX < 32 ||
        event.clientX > innerWidth - 32 ||
        excluded(event.target) ||
        document.querySelector("dialog[open]") ||
        !window.getSelection()?.isCollapsed
      )
        return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
    };
    const up = (event: PointerEvent) => {
      const first = start;
      start = null;
      if (
        !first ||
        first.id !== event.pointerId ||
        excluded(event.target) ||
        document.querySelector("dialog[open]") ||
        !window.getSelection()?.isCollapsed
      )
        return;
      const dx = event.clientX - first.x,
        dy = event.clientY - first.y;
      if (
        Math.abs(dx) < 65 ||
        Math.abs(dy) > 40 ||
        Math.abs(dx) < Math.abs(dy) * 1.8
      )
        return;
      const next = order[order.indexOf(current.current) + (dx < 0 ? 1 : -1)];
      // A classified swipe must not activate the card under the finger, even at an end tab.
      suppressClickUntil = performance.now() + 500;
      if (next) navigate(next);
    };
    const cancel = () => {
      start = null;
    };
    const click = (event: MouseEvent) => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    main.addEventListener("pointerdown", down, { passive: true });
    main.addEventListener("pointerup", up, { passive: true });
    main.addEventListener("pointercancel", cancel, { passive: true });
    main.addEventListener("click", click, true);
    return () => {
      main.removeEventListener("pointerdown", down);
      main.removeEventListener("pointerup", up);
      main.removeEventListener("pointercancel", cancel);
      main.removeEventListener("click", click, true);
    };
  }, [navigate]);
  return (
    <Navigation.Provider value={{ view, navigate }}>
      {children}
    </Navigation.Provider>
  );
}
export function CurrentTabs({
  updates,
  available,
  next,
}: {
  updates: React.ReactNode;
  available: React.ReactNode;
  next: React.ReactNode;
}) {
  const navigation = useCurrentNavigation();
  return (
    <>
      {order.map((view) => (
        <div
          key={view}
          hidden={navigation?.view !== view}
          data-current-view={view}
        >
          {{ updates, available, next }[view]}
        </div>
      ))}
    </>
  );
}
