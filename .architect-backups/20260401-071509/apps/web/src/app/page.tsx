"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const initialized = localStorage.getItem("ARCANUM_NODE_INITIALIZED");

    if (!initialized) {
      router.replace("/onboard");
    } else {
      router.replace("/hope");
    }
  }, [router]);

  return null;
}
