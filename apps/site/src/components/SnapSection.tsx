"use client";
import { PropsWithChildren } from "react";

// A full-viewport step that centers its child (the square card)
// Snap is mandatory, so every wheel/scroll lands on exactly one section.
export default function SnapSection({ children }: PropsWithChildren) {
  return (
    <section className="snap-center min-h-screen flex items-center justify-center px-4">
      {children}
    </section>
  );
}
