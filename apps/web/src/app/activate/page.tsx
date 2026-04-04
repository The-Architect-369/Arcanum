"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ActivatePage() {
  const router = useRouter();

  useEffect(() => {
    const initialized = window.localStorage.getItem("ARCANUM_NODE_INITIALIZED");
    const nextPath = initialized ? "/hope" : "/onboard";
    const qs = window.location.search || "";
    router.replace(`${nextPath}${qs}`);
  }, [router]);

  return null;
}
