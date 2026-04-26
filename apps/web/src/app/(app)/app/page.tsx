"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppEntryPage() {
  const router = useRouter();

  useEffect(() => {
    const initialized = window.localStorage.getItem("ARCANUM_NODE_INITIALIZED");
    const nextPath = initialized ? "/hope" : "/activate";
    router.replace(nextPath);
  }, [router]);

  return null;
}
