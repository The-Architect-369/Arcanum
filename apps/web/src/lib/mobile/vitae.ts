"use client";

import { addReceipt, getPersistentValue, setPersistentValue } from "@/lib/mobile/persistence";
import type { TempusContext } from "@/lib/tempus/context";

export type VitaePathKey = "guardian" | "weaver" | "steward";

export type VitaeSession = {
  id: string;
  practiceId: string;
  minutes: number;
  notes: string;
  completedAt: string;
  tempusContext?: TempusContext;
};

export type VitaeState = {
  selectedPath: VitaePathKey | null;
  sessions: VitaeSession[];
  updatedAt: string | null;
};

export const VITAE_PATHS: Array<{
  key: VitaePathKey;
  title: string;
  summary: string;
  emphasis: string[];
}> = [
  {
    key: "guardian",
    title: "Guardian",
    summary: "Steady, protective, boundary-conscious practice.",
    emphasis: ["consistency", "care", "stability"],
  },
  {
    key: "weaver",
    title: "Weaver",
    summary: "Pattern-making, relation-building, and synthesis.",
    emphasis: ["relation", "language", "composition"],
  },
  {
    key: "steward",
    title: "Steward",
    summary: "Practical service, maintenance, and long-view responsibility.",
    emphasis: ["service", "maintenance", "follow-through"],
  },
];

export const VITAE_PRACTICES: Array<{
  id: string;
  title: string;
  summary: string;
  suggestedMinutes: number;
}> = [
  {
    id: "witness",
    title: "Witness",
    summary: "Take a short pause and record what is true without pressure to perform.",
    suggestedMinutes: 10,
  },
  {
    id: "craft",
    title: "Craft",
    summary: "Shape one thing carefully: a note, a plan, a repair, or a response.",
    suggestedMinutes: 20,
  },
  {
    id: "service",
    title: "Service",
    summary: "Complete one act that makes the environment gentler or more usable for others.",
    suggestedMinutes: 15,
  },
];

const KEY = "vitae:state";
const EMPTY_STATE: VitaeState = {
  selectedPath: null,
  sessions: [],
  updatedAt: null,
};

function makeSessionId() {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `vitae:${suffix}`;
}

function normalizeSession(session: VitaeSession): VitaeSession {
  return {
    id: session.id,
    practiceId: session.practiceId,
    minutes: session.minutes,
    notes: session.notes ?? "",
    completedAt: session.completedAt,
    tempusContext: session.tempusContext,
  };
}

export async function getVitaeState(): Promise<VitaeState> {
  const persisted = await getPersistentValue<VitaeState>(KEY);
  if (!persisted) return EMPTY_STATE;
  return {
    selectedPath: persisted.selectedPath ?? null,
    sessions: Array.isArray(persisted.sessions) ? persisted.sessions.map(normalizeSession) : [],
    updatedAt: persisted.updatedAt ?? null,
  };
}

async function saveVitaeState(next: VitaeState) {
  await setPersistentValue(KEY, next);
  return next;
}

export async function selectVitaePath(path: VitaePathKey) {
  const current = await getVitaeState();
  const next: VitaeState = {
    ...current,
    selectedPath: path,
    updatedAt: new Date().toISOString(),
  };
  await saveVitaeState(next);
  await addReceipt({
    kind: "vitae_path",
    title: "Vitae path selected",
    summary: `Selected the ${path} path on this device.`,
    status: "confirmed",
    metadata: { path },
  });
  return next;
}

export async function recordVitaeSession(input: {
  practiceId: string;
  minutes: number;
  notes?: string;
  tempusContext?: TempusContext;
}) {
  const current = await getVitaeState();
  const completedAt = new Date().toISOString();
  const session: VitaeSession = {
    id: makeSessionId(),
    practiceId: input.practiceId,
    minutes: Math.max(1, Math.floor(input.minutes || 1)),
    notes: input.notes?.trim() || "",
    completedAt,
    tempusContext: input.tempusContext,
  };

  const next: VitaeState = {
    ...current,
    sessions: [session, ...current.sessions].slice(0, 100),
    updatedAt: session.completedAt,
  };

  await saveVitaeState(next);

  const practice = VITAE_PRACTICES.find((item) => item.id === input.practiceId);
  await addReceipt({
    kind: "vitae_session",
    title: "Vitae practice recorded",
    summary: `${practice?.title ?? input.practiceId} · ${session.minutes} minutes`,
    amount: session.minutes,
    status: "confirmed",
    metadata: {
      practiceId: input.practiceId,
      notes: session.notes,
      selectedPath: current.selectedPath,
      tempusContext: session.tempusContext
        ? {
            capturedAt: session.tempusContext.capturedAt,
            phase: session.tempusContext.phase,
            depth: session.tempusContext.layers.depth,
            activeLayers: session.tempusContext.layers.active,
            lunarPhase: session.tempusContext.lunar.phase,
            zodiacSign: session.tempusContext.zodiac.sign,
            planetaryDay: session.tempusContext.planetary.day,
            interpretation: null,
          }
        : undefined,
    },
  });

  return session;
}

export function summarizeVitae(state: VitaeState) {
  const sessionCount = state.sessions.length;
  const totalMinutes = state.sessions.reduce((sum, item) => sum + item.minutes, 0);
  const band =
    sessionCount >= 12 ? "Established" : sessionCount >= 5 ? "Steady" : sessionCount >= 1 ? "Beginning" : "Preview";

  return {
    sessionCount,
    totalMinutes,
    band,
    lastSessionAt: state.sessions[0]?.completedAt ?? null,
  };
}
