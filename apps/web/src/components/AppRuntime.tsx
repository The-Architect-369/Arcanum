"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { isPublicSitePath } from "@/lib/public-routes";

const DeviceRuntime = dynamic(() => import("./DeviceRuntime"));
const PWARegister = dynamic(() => import("./PWARegister"));

export default function AppRuntime() {
  const pathname = usePathname();
  // Public editorial pages do not mount wallet synchronization or install prompts.
  if (isPublicSitePath(pathname)) return null;
  return (
    <>
      <PWARegister />
      <DeviceRuntime />
    </>
  );
}
