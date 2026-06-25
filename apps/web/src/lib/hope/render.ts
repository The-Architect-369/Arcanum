"use client";

import type { HopeMode, HopeState } from "@/lib/hope/context";

export type HopePresetV1 = "quiet" | "steady" | "warm" | "deep";

export type HopeEmotionStateV1 =
  | "calm"
  | "bright"
  | "curious"
  | "heavy"
  | "tired"
  | "warm"
  | "focused";

export type HopeLifeDomainHintV1 =
  | "self"
  | "relationship"
  | "task"
  | "memory"
  | "tempus"
  | "vitae"
  | "unknown";

export type HopeInventorySlotsV1 = {
  head?: "founder_halo" | "kindred_frame" | null;
  neck?: "lumen_sash" | null;
  backdrop?: "signal_bloom" | "celestial_trim" | "archive_patch" | null;
};

export type HopePortraitLayersV1 = {
  baseBody: string;
  eyes: string;
  aura: string;
  foreheadSigil: string;
  chestSigil: string;
  accessoryHead?: string;
  accessoryNeck?: string;
  background?: string;
};

export type HopeVisibleChannelsV1 = {
  moodHue: HopePresetV1;
  expression: HopeEmotionStateV1;
  auraLevel: 0 | 1 | 2 | 3;
  sigilBrightness: 0 | 1 | 2 | 3;
  presencePercent: number;
};

export type HopeRenderStateV1 = {
  version: "hope.render.v1";
  mode: HopeMode;
  moodHue: HopePresetV1;
  emotion: HopeEmotionStateV1;
  auraLevel: 0 | 1 | 2 | 3;
  sigilBrightness: 0 | 1 | 2 | 3;
  presencePercent: number;
  reflectionCount: number;
  latestReflectionAt: string | null;
  activeDomain: HopeLifeDomainHintV1;
  hasTempusContext: boolean;
  hasVitaeContext: boolean;
  inventory: HopeInventorySlotsV1;
  layers: HopePortraitLayersV1;
};

export type DeriveHopeRenderStateV1Input = {
  hopeState: HopeState;
  mode: HopeMode;
  preset: HopePresetV1;
  presencePercent: number;
  inventory?: HopeInventorySlotsV1;
};

const EMPTY_INVENTORY: HopeInventorySlotsV1 = {
  head: null,
  neck: null,
  backdrop: null,
};

function clampPresence(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function deriveEmotion(preset: HopePresetV1): HopeEmotionStateV1 {
  switch (preset) {
    case "quiet":
      return "calm";
    case "steady":
      return "focused";
    case "warm":
      return "warm";
    case "deep":
      return "curious";
    default:
      return "calm";
  }
}

function deriveAuraLevel(reflectionCount: number): 0 | 1 | 2 | 3 {
  if (reflectionCount <= 0) return 0;
  if (reflectionCount <= 3) return 1;
  if (reflectionCount <= 12) return 2;
  return 3;
}

function deriveActiveDomain(args: {
  hasTempusContext: boolean;
  hasVitaeContext: boolean;
  latestUserText?: string;
}): HopeLifeDomainHintV1 {
  if (args.hasTempusContext) return "tempus";
  if (args.hasVitaeContext) return "vitae";

  const text = (args.latestUserText ?? "").toLowerCase();
  if (!text) return "self";
  if (/(mother|father|partner|friend|family|relationship|wife|husband|child)/.test(text)) return "relationship";
  if (/(task|work|job|project|deadline|todo|errand|store)/.test(text)) return "task";
  if (/(remember|memory|journal|dream|reflection|recall)/.test(text)) return "memory";
  return "self";
}

function deriveSigilBrightness(args: {
  hasLatestReflection: boolean;
  hasTempusContext: boolean;
  hasVitaeContext: boolean;
}): 0 | 1 | 2 | 3 {
  if (args.hasTempusContext || args.hasVitaeContext) return 3;
  if (args.hasLatestReflection) return 2;
  return 1;
}

function deriveLayers(args: {
  preset: HopePresetV1;
  emotion: HopeEmotionStateV1;
  auraLevel: 0 | 1 | 2 | 3;
  inventory: HopeInventorySlotsV1;
}): HopePortraitLayersV1 {
  const baseBody = "hope/base/guardian_seed_v1";
  const eyes = `hope/eyes/${args.emotion}`;
  const aura = `hope/aura/${args.preset}-${args.auraLevel}`;
  const foreheadSigil = `hope/sigil/forehead/${args.preset}`;
  const chestSigil = `hope/sigil/chest/${args.preset}`;

  return {
    baseBody,
    eyes,
    aura,
    foreheadSigil,
    chestSigil,
    accessoryHead: args.inventory.head ?? undefined,
    accessoryNeck: args.inventory.neck ?? undefined,
    background: args.inventory.backdrop ?? undefined,
  };
}

export function deriveHopeRenderStateV1(input: DeriveHopeRenderStateV1Input): HopeRenderStateV1 {
  const reflections = Array.isArray(input.hopeState.reflections) ? input.hopeState.reflections : [];
  const latest = reflections[0] ?? null;
  const reflectionCount = reflections.length;
  const presencePercent = clampPresence(input.presencePercent);
  const inventory = { ...EMPTY_INVENTORY, ...(input.inventory ?? {}) };
  const hasTempusContext = Boolean(latest?.context?.tempus);
  const hasVitaeContext = Boolean(latest?.context?.vitae);
  const emotion = deriveEmotion(input.preset);
  const auraLevel = deriveAuraLevel(reflectionCount);
  const sigilBrightness = deriveSigilBrightness({
    hasLatestReflection: Boolean(latest),
    hasTempusContext,
    hasVitaeContext,
  });
  const activeDomain = deriveActiveDomain({
    hasTempusContext,
    hasVitaeContext,
    latestUserText: latest?.userText,
  });

  return {
    version: "hope.render.v1",
    mode: input.mode,
    moodHue: input.preset,
    emotion,
    auraLevel,
    sigilBrightness,
    presencePercent,
    reflectionCount,
    latestReflectionAt: latest?.createdAt ?? null,
    activeDomain,
    hasTempusContext,
    hasVitaeContext,
    inventory,
    layers: deriveLayers({
      preset: input.preset,
      emotion,
      auraLevel,
      inventory,
    }),
  };
}
