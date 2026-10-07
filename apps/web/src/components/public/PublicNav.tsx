"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  return (
    <header className="public-header">
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
          className="public-menu-toggle"
          aria-expanded={open}
          aria-controls="public-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden="true">{open ? " −" : " +"}</span>
        </button>
        <nav
          id="public-navigation"
          aria-label="Main navigation"
          className={open ? "is-open" : ""}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              document
                .querySelector<HTMLButtonElement>(".public-menu-toggle")
                ?.focus();
            }
          }}
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
