"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppEntryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/hope/reflection");
  }, [router]);

  return null;
}
