"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Rss, Smartphone, Route } from "lucide-react";
const destinations = [
  { id: "updates", label: "Updates", icon: Rss },
  { id: "available", label: "Available", icon: Smartphone },
  { id: "next", label: "Coming next", icon: Route },
] as const;
export default function UpdatesTray({
  active = "updates",
}: {
  active?: string;
}) {
  const pathname = usePathname();
  const tray = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = tray.current;
    if (!element) return;
    const frame = element.closest<HTMLElement>(".updates-app");
    const measure = () =>
      frame?.style.setProperty(
        "--updates-tray-height",
        `${element.getBoundingClientRect().height}px`,
      );
    measure();
    if (!("ResizeObserver" in window)) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <nav
      ref={tray}
      className="updates-nav"
      aria-label="Follow Arcanum development"
    >
      {destinations.map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={`/updates?view=${id}`}
          aria-current={id === active ? "page" : undefined}
          onClick={(event) => {
            const home =
              pathname === "/updates" ||
              (pathname === "/" &&
                window.location.hostname === "updates.the-arcanum.net");
            if (
              id !== "updates" ||
              active !== "updates" ||
              !home ||
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            window.dispatchEvent(new Event("arcanum:updates-top"));
          }}
        >
          <Icon size={22} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
