"use client";

import { useEffect, useState } from "react";
import { getNarrative, NarrativeContent } from "@/content/narrative";

export function useNarrative() {
  const [locale, setLocale] = useState("en");
  const [content, setContent] = useState<NarrativeContent>(getNarrative("en"));

  useEffect(() => {
    const supported = ["en", "es", "fr", "de"];
    const stored = localStorage.getItem("arcanum-locale");

    if (stored && supported.includes(stored)) {
      setLocale(stored);
      setContent(getNarrative(stored));
    } else {
      const browserLang =
        typeof navigator !== "undefined"
          ? navigator.language.split("-")[0].toLowerCase()
          : "en";
      const detected = supported.includes(browserLang)
        ? browserLang
        : "en";
      localStorage.setItem("arcanum-locale", detected);
      setLocale(detected);
      setContent(getNarrative(detected));
    }
  }, []);

  const changeLocale = (newLocale: string) => {
    localStorage.setItem("arcanum-locale", newLocale);
    setLocale(newLocale);
    setContent(getNarrative(newLocale));
  };

  return { locale, content, changeLocale };
}
