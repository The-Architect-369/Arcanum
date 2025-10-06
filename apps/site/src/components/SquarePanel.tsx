"use client";
import { cn } from "../styles/cn";
import { PropsWithChildren } from "react";

type Size = "xs" | "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  xs: "w-[min(92vw,360px)]",
  sm: "w-[min(90vw,420px)]",
  md: "w-[min(88vw,560px)]",
  lg: "w-[min(86vw,680px)]",
};

export function SquarePanel({
  title,
  subtitle,
  children,
  size = "sm",
}: PropsWithChildren<{ title: string; subtitle?: string; size?: Size }>) {
  return (
    <section
      className={cn(
        "relative aspect-square max-w-[680px]",
        sizeMap[size],
        "rounded-3xl bg-gradient-to-br from-white/6 to-white/2",
        "p-5 sm:p-6 text-white",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
        "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.12),transparent_60%)]",
        "after:pointer-events-none after:absolute after:inset-[-1px] after:-z-10 after:rounded-[inherit] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] after:opacity-80"
      )}
    >
      <header className="mb-2">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-white/70">{subtitle}</p>}
      </header>
      <div className="h-px w-full bg-white/10" />
      <div className="mt-3 sm:mt-4">{children}</div>
    </section>
  );
}
