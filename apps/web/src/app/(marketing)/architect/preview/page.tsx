import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArchitectWorkspace from "@/components/architect/ArchitectWorkspace";
import { architectDemo } from "@/lib/architect/demo";
import "../architect.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Architect synthetic layout preview",
  robots: { index: false, follow: false },
};
export default function Preview() {
  if (process.env.VERCEL_ENV !== "preview") notFound();
  return (
    <ArchitectWorkspace
      initial={architectDemo}
      demo
      accountControl={<a href="/architect/login">Google setup / sign-in</a>}
    />
  );
}
