import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";

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

const locales: Record<string, NarrativeContent> = { en, es, fr, de };

/**
 * Static default (safe for SSR / SSG)
 */
export const copy: NarrativeContent = en;

/**
 * Retrieves locale content (client-only)
 */
export function getNarrative(locale: string): NarrativeContent {
  return locales[locale] || en;
}
