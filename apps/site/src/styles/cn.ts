// apps/site/src/styles/cn.ts
// Minimal className combiner that works with Tailwind (no extra deps)
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
