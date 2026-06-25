export function inferPreset(hopeState: any): "steady" | "emergent" | "reflective" {
  const reflections = hopeState?.reflections ?? [];

  if (reflections.length === 0) return "steady";

  const latest = reflections[reflections.length - 1];

  if (latest.intensity > 0.7) return "emergent";
  if (latest.intensity < 0.3) return "reflective";

  return "steady";
}
