// 🜁 Element combinator — merges class strings gracefully.
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
