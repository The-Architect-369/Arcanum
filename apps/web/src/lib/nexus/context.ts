"use client";

import { addReceipt, getPersistentValue, setPersistentValue } from "@/lib/mobile/persistence";
import type { TempusContext } from "@/lib/tempus/context";

export type NexusVisibility = "public" | "channel" | "group" | "private_draft";

export type NexusContext = {
  version: "nexus.context.v0.1";
  capturedAt: string;
  identityId?: string | null;
  activeChannelId?: string;
  visibility: NexusVisibility;
  source: "matrix" | "local_draft" | "arcnet_receipt" | "helia_cid";
  warnings: string[];
};

export type NexusProposalKind = "post" | "event" | "ritual" | "channel";

export type NexusProposalStatus = "draft" | "submitted" | "scheduled" | "declined";

export type NexusEventProposal = {
  id: string;
  createdAt: string;
  kind: NexusProposalKind;
  title: string;
  summary: string;
  proposedBy?: string | null;
  activeChannelId?: string;
  visibility: NexusVisibility;
  tempusContext?: Pick<
    TempusContext,
    "capturedAt" | "phase" | "solar" | "lunar" | "zodiac" | "planetary" | "layers" | "interpretation"
  >;
  hopeDraftId?: string;
  status: NexusProposalStatus;
  executionAuthority: "none" | "human_review" | "governance_required";
  receiptStatus: "local_only" | "published" | "anchored";
  authority: "non_executing_draft";
  meaning: null;
};

export type NexusState = {
  proposals: NexusEventProposal[];
  updatedAt: string | null;
};

const KEY = "nexus:state";
const MAX_LOCAL_PROPOSALS = 100;
const EMPTY_STATE: NexusState = {
  proposals: [],
  updatedAt: null,
};

function makeProposalId() {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `nexus:${suffix}`;
}

export function createNexusContext(input: {
  identityId?: string | null;
  activeChannelId?: string;
  visibility?: NexusVisibility;
  source?: NexusContext["source"];
  capturedAt?: Date;
} = {}): NexusContext {
  const visibility = input.visibility ?? "private_draft";
  const source = input.source ?? "local_draft";
  const warnings: string[] = [];

  if (visibility === "private_draft") {
    warnings.push("This Nexus object is a local draft and has not been published or scheduled.");
  }

  if (source === "local_draft") {
    warnings.push("Local drafts do not execute events, schedule rituals, or create governance authority.");
  }

  return {
    version: "nexus.context.v0.1",
    capturedAt: (input.capturedAt ?? new Date()).toISOString(),
    identityId: input.identityId ?? null,
    activeChannelId: input.activeChannelId,
    visibility,
    source,
    warnings,
  };
}

function summarizeTempusContext(tempusContext?: TempusContext): NexusEventProposal["tempusContext"] {
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

function normalizeProposal(proposal: NexusEventProposal): NexusEventProposal {
  return {
    id: proposal.id,
    createdAt: proposal.createdAt,
    kind: proposal.kind,
    title: proposal.title,
    summary: proposal.summary,
    proposedBy: proposal.proposedBy ?? null,
    activeChannelId: proposal.activeChannelId,
    visibility: proposal.visibility ?? "private_draft",
    tempusContext: proposal.tempusContext,
    hopeDraftId: proposal.hopeDraftId,
    status: proposal.status ?? "draft",
    executionAuthority: proposal.executionAuthority ?? "human_review",
    receiptStatus: proposal.receiptStatus ?? "local_only",
    authority: "non_executing_draft",
    meaning: null,
  };
}

export async function getNexusState(): Promise<NexusState> {
  const persisted = await getPersistentValue<NexusState>(KEY);
  if (!persisted) return EMPTY_STATE;
  return {
    proposals: Array.isArray(persisted.proposals) ? persisted.proposals.map(normalizeProposal) : [],
    updatedAt: persisted.updatedAt ?? null,
  };
}

async function saveNexusState(next: NexusState) {
  await setPersistentValue(KEY, next);
  return next;
}

export async function recordNexusProposal(input: {
  kind: NexusProposalKind;
  title: string;
  summary: string;
  proposedBy?: string | null;
  activeChannelId?: string;
  visibility?: NexusVisibility;
  tempusContext?: TempusContext;
  hopeDraftId?: string;
  executionAuthority?: "none" | "human_review" | "governance_required";
}) {
  const title = input.title.trim();
  const summary = input.summary.trim();

  if (!title) {
    return { ok: false as const, message: "Proposal title is required." };
  }

  if (!summary) {
    return { ok: false as const, message: "Proposal summary is required." };
  }

  const current = await getNexusState();
  const createdAt = new Date().toISOString();
  const proposal: NexusEventProposal = {
    id: makeProposalId(),
    createdAt,
    kind: input.kind,
    title,
    summary,
    proposedBy: input.proposedBy ?? null,
    activeChannelId: input.activeChannelId,
    visibility: input.visibility ?? "private_draft",
    tempusContext: summarizeTempusContext(input.tempusContext),
    hopeDraftId: input.hopeDraftId,
    status: "draft",
    executionAuthority: input.executionAuthority ?? "human_review",
    receiptStatus: "local_only",
    authority: "non_executing_draft",
    meaning: null,
  };

  const next: NexusState = {
    proposals: [proposal, ...current.proposals].slice(0, MAX_LOCAL_PROPOSALS),
    updatedAt: createdAt,
  };

  await saveNexusState(next);
  await addReceipt({
    kind: "nexus_proposal_draft",
    title: "Nexus proposal draft recorded",
    summary: `${proposal.kind} · ${proposal.title}`,
    status: "confirmed",
    createdAt,
    metadata: {
      proposalId: proposal.id,
      kind: proposal.kind,
      visibility: proposal.visibility,
      executionAuthority: proposal.executionAuthority,
      authority: proposal.authority,
      hasTempusContext: Boolean(proposal.tempusContext),
      meaning: null,
    },
  });

  return { ok: true as const, proposal, state: next };
}

export async function updateNexusProposalStatus(
  id: string,
  status: NexusProposalStatus,
  options: { receiptStatus?: NexusEventProposal["receiptStatus"] } = {}
) {
  const current = await getNexusState();
  const updatedAt = new Date().toISOString();
  const next: NexusState = {
    proposals: current.proposals.map((proposal) =>
      proposal.id === id
        ? {
            ...proposal,
            status,
            receiptStatus: options.receiptStatus ?? proposal.receiptStatus,
            authority: "non_executing_draft" as const,
            meaning: null,
          }
        : proposal
    ),
    updatedAt,
  };

  await saveNexusState(next);
  await addReceipt({
    kind: "nexus_proposal_status_updated",
    title: "Nexus proposal status updated",
    summary: `${id} · ${status}`,
    status: "info",
    createdAt: updatedAt,
    metadata: {
      proposalId: id,
      status,
      meaning: null,
    },
  });

  return next;
}
