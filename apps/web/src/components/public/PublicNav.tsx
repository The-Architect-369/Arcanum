"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
const links = [
  ["/about", "The vision"],
  ["/explore", "Explore"],
  ["/principles", "Principles"],
  ["/updates", "Journal"],
  ["/journeys", "Journeys"],
  ["/download", "Get Arcanum"],
];
export default function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return (
    <header
      className="public-header"
      ref={header}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="public-shell public-nav">
        <Link
          className="public-brand"
          href="https://the-arcanum.net/"
          onClick={() => setOpen(false)}
          aria-label="Arcanum home"
        >
          <Image
            src="/logo-arcanum.svg"
            alt=""
            width={36}
            height={36}
            priority
          />
          <span>
            ARCANUM<small>A HUMAN JOURNEY</small>
          </span>
        </Link>
        <button
          ref={toggle}
          type="button"
          className="public-menu-toggle"
          aria-expanded={open}
          aria-controls="public-navigation"
          onClick={() => setOpen(!open)}
        >
          <span>{open ? "Close" : "Menu"}</span>
          <span className="public-menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        <nav
          id="public-navigation"
          aria-label="Main navigation"
          className={open ? "is-open" : ""}
          hidden={!open}
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={
                pathname === href ||
                (href === "/explore" && pathname.startsWith("/explore/"))
                  ? "page"
                  : undefined
              }
            >
              {label}
              {href === "/download" && <span aria-hidden="true"> ↗</span>}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
