"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Logo({ src = "/logo.svg" }: { src?: string }) {
  // Uses your existing logo asset; falls back to a simple ring if missing
  return (
    <div className="flex items-center gap-2">
      {/* Replace src with your actual logo path if different (e.g., /images/arcanum-logo.svg) */}
      <Image
        src={src}
        alt="Arcanum"
        width={28}
        height={28}
        className="rounded-md ring-1 ring-white/10"
        priority
      />
      <span className="text-white/90 hover:text-white text-sm font-semibold tracking-tight">Arcanum</span>
    </div>
  );
}

function Hamburger({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <button
      aria-label="Open menu"
      onClick={() => setOpen(!open)}
      className="group relative h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
    >
      <span
        className="absolute left-[7px] top-[10px] block h-[2px] w-[15px] bg-white transition group-hover:w-[16px]"
        style={{ transform: open ? "translateY(4px) rotate(45deg)" : "" }}
      />
      <span
        className="absolute left-[7px] top-[15px] block h-[2px] w-[15px] bg-white transition"
        style={{ opacity: open ? 0 : 1 }}
      />
      <span
        className="absolute left-[7px] top-[20px] block h-[2px] w-[15px] bg-white transition group-hover:w-[16px]"
        style={{ transform: open ? "translateY(-4px) rotate(-45deg)" : "" }}
      />
    </button>
  );
}

export default function Header({ logoSrc = "/logo.svg" }: { logoSrc?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-14 w-full max-w-screen-xl items-center justify-between px-4">
          <Link href="/" aria-label="Go to Arcanum home">
            <Logo src={logoSrc} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-xs text-white/70 sm:flex">
            <Link href="/arcnet" className="hover:text-white">ARCnet</Link>
            <Link href="/install" className="hover:text-white">Install</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/legal" className="hover:text-white">Legal</Link>
          </nav>

          {/* Mobile hamburger */}
          <div className="sm:hidden">
            <Hamburger open={open} setOpen={setOpen} />
          </div>
        </div>

        {/* glass bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-14 bg-black/20 backdrop-blur-md ring-1 ring-white/10" />
      </header>

      {/* Mobile menu sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="absolute right-0 top-0 h-full w-[82vw] max-w-xs bg-[#0b1117] p-5 ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <Logo src={logoSrc} />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-xl bg-white/5 px-3 py-1.5 text-xs ring-1 ring-white/10 hover:bg-white/10"
                >
                  Close
                </button>
              </div>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="/arcnet" className="rounded-lg px-2 py-2 hover:bg-white/5">ARCnet</Link>
                <Link href="/install" className="rounded-lg px-2 py-2 hover:bg-white/5">Install</Link>
                <Link href="/faq" className="rounded-lg px-2 py-2 hover:bg-white/5">FAQ</Link>
                <Link href="/legal" className="rounded-lg px-2 py-2 hover:bg-white/5">Legal</Link>
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
