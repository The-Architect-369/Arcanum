"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ActivatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialized = localStorage.getItem("ARCANUM_NODE_INITIALIZED");
    const nextPath = initialized ? "/hope" : "/onboard";
    const qs = searchParams.toString();
    router.replace(qs ? `${nextPath}?${qs}` : nextPath);
  }, [router, searchParams]);

  return null;
}
