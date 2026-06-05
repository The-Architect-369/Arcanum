"use client";

import { addReceipt, getPersistentValue, setPersistentValue } from "@/lib/mobile/persistence";
import type { TempusContext } from "@/lib/tempus/context";

export type RitesCreditSource =
  | "tempus_rite_recorded"
  | "vitae_practice_recorded"
  | "public_event_hosted"
  | "governance_draft_assistance"
  | "educational_contribution"
  | "builder_contribution"
  | "governance_approved_program";

export type RitesCreditStatus = "active" | "voided_for_error";

export type RitesCreditRecord = {
  id: string;
  source: RitesCreditSource;
  amount: number;
  status: RitesCreditStatus;
  issuedAt: string;
  reason: string;
  identityId?: string | null;
  sourceRef?: string;
  tempusContext?: Pick<
    TempusContext,
    "capturedAt" | "phase" | "solar" | "lunar" | "zodiac" | "planetary" | "layers" | "interpretation"
  >;
  conversionStatus: "not_convertible" | "eligible_for_future_policy" | "converted";
  meaning: null;
};

export type RitesState = {
  credits: RitesCreditRecord[];
  updatedAt: string | null;
};

export type IssueRitesCreditResult =
  | { ok: true; credit: RitesCreditRecord; state: RitesState }
  | { ok: false; message: string };

const KEY = "rites:state";
const EMPTY_STATE: RitesState = {
  credits: [],
  updatedAt: null,
};

const MAX_LOCAL_CREDIT_AMOUNT = 1;
const MAX_LOCAL_CREDITS = 250;

function makeRitesId() {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `rites:${suffix}`;
}

function normalizeCredit(input: RitesCreditRecord): RitesCreditRecord {
  return {
    id: input.id,
    source: input.source,
    amount: Math.max(0, Math.floor(Number(input.amount) || 0)),
    status: input.status === "voided_for_error" ? "voided_for_error" : "active",
    issuedAt: input.issuedAt,
    reason: input.reason,
    identityId: input.identityId ?? null,
    sourceRef: input.sourceRef,
    tempusContext: input.tempusContext,
    conversionStatus: input.conversionStatus ?? "not_convertible",
    meaning: null,
  };
}

function activeAmount(credits: RitesCreditRecord[]) {
  return credits
    .filter((credit) => credit.status === "active")
    .reduce((sum, credit) => sum + credit.amount, 0);
}

export async function getRitesState(): Promise<RitesState> {
  const persisted = await getPersistentValue<RitesState>(KEY);
  if (!persisted) return EMPTY_STATE;
  return {
    credits: Array.isArray(persisted.credits) ? persisted.credits.map(normalizeCredit) : [],
    updatedAt: persisted.updatedAt ?? null,
  };
}

async function saveRitesState(next: RitesState) {
  await setPersistentValue(KEY, next);
  return next;
}

export function summarizeRites(state: RitesState) {
  const activeCredits = state.credits.filter((credit) => credit.status === "active");
  const voidedCredits = state.credits.filter((credit) => credit.status === "voided_for_error");
  return {
    activeCount: activeCredits.length,
    voidedCount: voidedCredits.length,
    activeAmount: activeAmount(activeCredits),
    totalRecords: state.credits.length,
    lastIssuedAt: activeCredits[0]?.issuedAt ?? null,
    conversionStatus: "not_convertible" as const,
  };
}

export async function issueRitesCredit(input: {
  source: RitesCreditSource;
  reason: string;
  amount?: number;
  identityId?: string | null;
  sourceRef?: string;
  tempusContext?: TempusContext;
}): Promise<IssueRitesCreditResult> {
  const amount = Math.max(0, Math.floor(Number(input.amount ?? 1) || 0));
  const reason = input.reason.trim();

  if (amount <= 0) {
    return { ok: false, message: "RITES credit amount must be greater than zero." };
  }

  if (amount > MAX_LOCAL_CREDIT_AMOUNT) {
    return { ok: false, message: "Local scaffold RITES credits are capped at 1 per eligible action." };
  }

  if (!reason) {
    return { ok: false, message: "RITES credit reason is required." };
  }

  const current = await getRitesState();
  const issuedAt = new Date().toISOString();
  const credit: RitesCreditRecord = {
    id: makeRitesId(),
    source: input.source,
    amount,
    status: "active",
    issuedAt,
    reason,
    identityId: input.identityId ?? null,
    sourceRef: input.sourceRef,
    tempusContext: input.tempusContext
      ? {
          capturedAt: input.tempusContext.capturedAt,
          phase: input.tempusContext.phase,
          solar: input.tempusContext.solar,
          lunar: input.tempusContext.lunar,
          zodiac: input.tempusContext.zodiac,
          planetary: input.tempusContext.planetary,
          layers: input.tempusContext.layers,
          interpretation: null,
        }
      : undefined,
    conversionStatus: "not_convertible",
    meaning: null,
  };

  const next: RitesState = {
    credits: [credit, ...current.credits].slice(0, MAX_LOCAL_CREDITS),
    updatedAt: issuedAt,
  };

  await saveRitesState(next);
  await addReceipt({
    kind: "rites_credit_issued",
    title: "RITES participation credit recorded",
    summary: `${credit.amount} non-transferable local RITES credit · ${credit.reason}`,
    amount: credit.amount,
    status: "confirmed",
    createdAt: issuedAt,
    metadata: {
      creditId: credit.id,
      source: credit.source,
      sourceRef: credit.sourceRef,
      conversionStatus: credit.conversionStatus,
      meaning: null,
    },
  });

  return { ok: true, credit, state: next };
}

export async function voidRitesCreditForError(id: string, reason: string) {
  const current = await getRitesState();
  const nextCredits = current.credits.map((credit) =>
    credit.id === id
      ? {
          ...credit,
          status: "voided_for_error" as const,
          reason: `${credit.reason} · Voided: ${reason}`,
          conversionStatus: "not_convertible" as const,
          meaning: null,
        }
      : credit
  );
  const updatedAt = new Date().toISOString();
  const next: RitesState = {
    credits: nextCredits,
    updatedAt,
  };

  await saveRitesState(next);
  await addReceipt({
    kind: "rites_credit_voided_for_error",
    title: "RITES credit voided for error",
    summary: reason,
    status: "info",
    createdAt: updatedAt,
    metadata: {
      creditId: id,
      meaning: null,
    },
  });

  return next;
}
