"use client";
import { PropsWithChildren } from "react";
export default function SnapSection({ children }: PropsWithChildren) {
  return <section className="snap-section">{children}</section>;
}
