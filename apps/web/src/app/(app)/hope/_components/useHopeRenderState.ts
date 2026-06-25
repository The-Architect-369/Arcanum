import { computePresence } from "@/lib/hope/render/computePresence";
import { inferPreset } from "@/lib/hope/render/inferPreset";

export function useHopeRenderState(hopeState: any, mode: "solo" | "social") {
  return {
    presencePercent: computePresence(hopeState),
    preset: inferPreset(hopeState),
    mode,
  };
}
