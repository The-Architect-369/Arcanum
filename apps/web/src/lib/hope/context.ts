"use client";

import { addReceipt, getPersistentValue, setPersistentValue } from "@/lib/mobile/persistence";
import type { TempusContext } from "@/lib/tempus/context";
import type { VitaeState } from "@/lib/mobile/vitae";

export type HopeMode = "presence" | "reflection" | "attunement";

export type HopeResponsePosture = {
  mode: HopeMode;
  authority: "advisory_only";
  canClarify: boolean;
  canMirror: boolean;
  canDraft: boolean;
  canExecute: false;
  canRatify: false;
  canConfirmReadiness: false;
};

export type HopeContext = {
  version: "hope.context.v0.1";
  capturedAt: string;
  mode: HopeMode;
  identityId?: string | null;
  allowedInputs: {
    tempusContextId?: string;
    vitaeContextId?: string;
    localReflectionIds?: string[];
  };
  posture: HopeResponsePosture;
  privacy: {
    reflectionsDefault: "local_private";
    exportRequiresConsent: true;
  };
};

export type HopeReflectionRecord = {
  id: string;
  createdAt: string;
  mode: HopeMode;
  prompt?: string;
  userText: string;
  hopeText?: string;
  context?: {
    tempus?: Pick<
      TempusContext,
      "capturedAt" | "phase" | "solar" | "lunar" | "zodiac" | "planetary" | "layers" | "interpretation"
    >;
    vitae?: {
      selectedPath: VitaeState["selectedPath"];
      sessionCount: number;
      latestSessionAt?: string | null;
      interpretation: null;
    };
  };
  visibility: "local_private" | "consented_export";
  receiptStatus: "local_only" | "queued" | "anchored";
  authority: "advisory_only";
  interpretation: null;
};

export type HopeState = {
  reflections: HopeReflectionRecord[];
  updatedAt: string | null;
};

const KEY = "hope:reflections";
const MAX_LOCAL_REFLECTIONS = 100;
const EMPTY_STATE: HopeState = {
  reflections: [],
  updatedAt: null,
};

function makeReflectionId() {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `hope:${suffix}`;
}

export function createHopePosture(mode: HopeMode): HopeResponsePosture {
  return {
    mode,
    authority: "advisory_only",
    canClarify: mode === "reflection" || mode === "attunement",
    canMirror: mode === "reflection",
    canDraft: mode === "reflection",
    canExecute: false,
    canRatify: false,
    canConfirmReadiness: false,
  };
}

export function createHopeContext(
  mode: HopeMode,
  options: {
    identityId?: string | null;
    tempusContextId?: string;
    vitaeContextId?: string;
    localReflectionIds?: string[];
    capturedAt?: Date;
  } = {}
): HopeContext {
  return {
    version: "hope.context.v0.1",
    capturedAt: (options.capturedAt ?? new Date()).toISOString(),
    mode,
    identityId: options.identityId ?? null,
    allowedInputs: {
      tempusContextId: options.tempusContextId,
      vitaeContextId: options.vitaeContextId,
      localReflectionIds: options.localReflectionIds,
    },
    posture: createHopePosture(mode),
    privacy: {
      reflectionsDefault: "local_private",
      exportRequiresConsent: true,
    },
  };
}

function summarizeTempusContext(tempusContext?: TempusContext): HopeReflectionRecord["context"] extends infer C
  ? C extends { tempus?: infer T }
    ? T | undefined
    : never
  : never {
  if (!tempusContext) return undefined;
  return {
    capturedAt: tempusContext.capturedAt,
    phase: tempusContext.phase,
    solar: tempusContext.solar,
    lunar: tempusContext.lunar,
    zodiac: tempusContext.zodiac,
    planetary: tempusContext.planetary,
    layers: tempusContext.layers,
    interpretation: null,
  };
}

function summarizeVitaeState(vitaeState?: VitaeState): HopeReflectionRecord["context"] extends infer C
  ? C extends { vitae?: infer V }
    ? V | undefined
    : never
  : never {
  if (!vitaeState) return undefined;
  return {
    selectedPath: vitaeState.selectedPath,
    sessionCount: vitaeState.sessions.length,
    latestSessionAt: vitaeState.sessions[0]?.completedAt ?? null,
    interpretation: null,
  };
}

function normalizeReflection(reflection: HopeReflectionRecord): HopeReflectionRecord {
  return {
    id: reflection.id,
    createdAt: reflection.createdAt,
    mode: reflection.mode,
    prompt: reflection.prompt,
    userText: reflection.userText,
    hopeText: reflection.hopeText,
    context: reflection.context,
    visibility: reflection.visibility ?? "local_private",
    receiptStatus: reflection.receiptStatus ?? "local_only",
    authority: "advisory_only",
    interpretation: null,
  };
}

export async function getHopeState(): Promise<HopeState> {
  const persisted = await getPersistentValue<HopeState>(KEY);
  if (!persisted) return EMPTY_STATE;
  return {
    reflections: Array.isArray(persisted.reflections) ? persisted.reflections.map(normalizeReflection) : [],
    updatedAt: persisted.updatedAt ?? null,
  };
}

async function saveHopeState(next: HopeState) {
  await setPersistentValue(KEY, next);
  return next;
}

export async function recordHopeReflection(input: {
  userText: string;
  prompt?: string;
  hopeText?: string;
  tempusContext?: TempusContext;
  vitaeState?: VitaeState;
  visibility?: "local_private" | "consented_export";
}) {
  const userText = input.userText.trim();
  if (!userText) {
    return { ok: false as const, message: "Reflection text is required." };
  }

  const current = await getHopeState();
  const createdAt = new Date().toISOString();
  const tempus = summarizeTempusContext(input.tempusContext);
  const vitae = summarizeVitaeState(input.vitaeState);
  const reflection: HopeReflectionRecord = {
    id: makeReflectionId(),
    createdAt,
    mode: "reflection",
    prompt: input.prompt,
    userText,
    hopeText: input.hopeText,
    context: tempus || vitae ? { tempus, vitae } : undefined,
    visibility: input.visibility ?? "local_private",
    receiptStatus: "local_only",
    authority: "advisory_only",
    interpretation: null,
  };

  const next: HopeState = {
    reflections: [reflection, ...current.reflections].slice(0, MAX_LOCAL_REFLECTIONS),
    updatedAt: createdAt,
  };

  await saveHopeState(next);
  await addReceipt({
    kind: "hope_reflection",
    title: "Hope reflection recorded",
    summary: "Local advisory reflection recorded on this device.",
    status: "confirmed",
    createdAt,
    metadata: {
      reflectionId: reflection.id,
      visibility: reflection.visibility,
      authority: reflection.authority,
      hasTempusContext: Boolean(tempus),
      hasVitaeSummary: Boolean(vitae),
      interpretation: null,
    },
  });

  return { ok: true as const, reflection, state: next };
}
