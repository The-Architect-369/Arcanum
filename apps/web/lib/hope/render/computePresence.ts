export function computePresence(hopeState: any): number {
  const reflections = hopeState?.reflections ?? [];

  if (reflections.length === 0) return 20;

  const latest = reflections[reflections.length - 1];
  const ageMs = Date.now() - new Date(latest.createdAt).getTime();

  const hours = ageMs / (1000 * 60 * 60);

  if (hours < 1) return 95;
  if (hours < 6) return 85;
  if (hours < 24) return 70;
  if (hours < 72) return 50;
  return 30;
}
