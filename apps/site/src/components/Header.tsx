"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import { Globe2 } from "lucide-react";
import { useNarrative } from "@/hooks/useNarrative";

export default function Header({ brand = "Arcanum" }: { brand?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, changeLocale } = useNarrative();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !(menuRef.current as any).contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHomeClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const isHome = pathname === "/";
      const hero = document.getElementById("hero");
      if (isHome && hero) hero.scrollIntoView({ behavior: "smooth" });
      else router.push("/#hero");
    },
    [pathname, router]
  );

  const handleActivateClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const isHome = pathname === "/";
      const activate = document.getElementById("activate");
      if (isHome && activate) activate.scrollIntoView({ behavior: "smooth" });
      else router.push("/#activate");
    },
    [pathname, router]
  );

  const locales = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="mx-auto flex h-14 w-full max-w-screen-xl items-center justify-between px-4 relative">
        <Link href="/#hero" onClick={handleHomeClick} aria-label="Home" className="cursor-pointer" prefetch={false}>
          <div className="flex items-center gap-2 select-none">
            <div className="relative h-7 w-7 overflow-hidden rounded-md ring-1 ring-white/10 bg-white/5">
              <Image src="/logo-arcanum.svg" alt={`${brand} logo`} fill priority sizes="28px" className="p-1 object-contain" />
            </div>
            <span className="text-white/90 text-sm font-semibold tracking-tight">{brand}</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-200"
              aria-label="Change language"
            >
              <Globe2 className="w-5 h-5 text-white/90" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-md bg-neutral-900/90 border border-white/10 shadow-lg backdrop-blur-md">
                {locales.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      changeLocale(l.code);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 ${
                      locale === l.code ? "text-cyan-300" : "text-white/80"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/#activate"
            onClick={handleActivateClick}
            className="inline-flex h-9 items-center rounded-xl px-3 text-xs font-medium bg-gradient-to-r from-[#a78bfa]/20 to-[#93c5fd]/20 ring-1 ring-white/10 hover:bg-white/10 transition-all duration-300"
            aria-label="Activate Account"
            prefetch={false}
          >
            Activate Account
          </Link>
        </div>
      </div>
    </header>
  );
}
