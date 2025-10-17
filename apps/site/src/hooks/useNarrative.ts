"use client";
import { useEffect, useState } from "react";
import { loadNarrative, NarrativeContent } from "@/content/narrative";

export function useNarrative(locale: string = "en") {
  const [content, setContent] = useState<NarrativeContent | null>(null);

  useEffect(() => {
    loadNarrative(locale).then(setContent);
  }, [locale]);

  return content;
}
