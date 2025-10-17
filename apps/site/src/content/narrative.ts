// src/content/narrative.ts
import en from "./locales/en.json";

export type ShowcaseVariant = "arcnet" | "mana" | "tempus";

export interface ShowcaseItem {
  title: string;
  body: string;
  image: string;
}

export interface ShowcaseContent {
  heading: string;
  sub?: string;
  items: ShowcaseItem[];
}

export interface NarrativeContent {
  hero: {
    title: string;
    line1: string;
    line2: string;
    tagline: string;
  };
  activate: {
    title: string;
    descCompact: string;
    descFull: string;
    tagline: string;
  };
  showcase: Record<ShowcaseVariant, ShowcaseContent>;
}

/**
 * Loads a narrative file dynamically based on locale.
 * Defaults to English ("en").
 * 
 * Example:
 * const content = await loadNarrative("es");
 */
export async function loadNarrative(locale: string = "en"): Promise<NarrativeContent> {
  try {
    const mod = await import(`./locales/${locale}.json`);
    return mod.default as NarrativeContent;
  } catch (err) {
    console.warn(`[narrative] Falling back to English for locale: ${locale}`);
    return en as NarrativeContent;
  }
}

/**
 * Static default export for build-time environments that can’t handle dynamic import.
 */
export const copy: NarrativeContent = en as NarrativeContent;
