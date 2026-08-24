export const CAPABILITY_STATES = [
  'INELIGIBLE',
  'ELIGIBLE',
  'REVIEWED',
  'GRANTED',
  'ACTIVE',
  'SUSPENDED',
  'EXPIRED',
] as const;

export type CapabilityState = (typeof CAPABILITY_STATES)[number];

export type EvidenceKind = 'vitae' | 'domain' | 'safety';

export type EvidenceRequirement = {
  id: string;
  label: string;
};

export type EvidenceGroup = {
  id: string;
  label: string;
  kind: EvidenceKind;
  operator: 'all' | 'any';
  items: EvidenceRequirement[];
};

export type CapabilityPolicy = {
  id: string;
  system: 'commercium' | 'protection' | 'imperium' | 'architect';
  label: string;
  verb: string;
  riskLane: 'ordinary-participation' | 'contributory' | 'stewardship' | 'high-consequence';
  humanIntent: string;
  evidenceGroups: EvidenceGroup[];
  review: {
    required: boolean;
    label: string;
  };
  grant: {
    required: boolean;
    label: string;
  };
  execution: {
    requiresRegisteredAction: boolean;
    requiresDestinationAcceptance: boolean;
  };
  junctionContext: string[];
  edgeContractRequired: boolean;
  authorityNote: string;
};

export type ForbiddenAuthoritySignals = {
  currentVitaePosition?: boolean;
  gradeIndex?: boolean;
  achievementTitle?: boolean;
  geometryAlignment?: boolean;
};

export type CapabilityFacts = {
  evidence: Record<string, boolean>;
  reviewPassed: boolean;
  explicitGrant: boolean;
  actionRegistered: boolean;
  destinationAccepted: boolean;
  suspended: boolean;
  expiresAt: string | null;
  evaluatedAt?: string | Date;
  forbiddenSignals?: ForbiddenAuthoritySignals;
};

export type EvidenceGroupResult = EvidenceGroup & {
  satisfied: boolean;
  satisfiedItems: string[];
  missingItems: string[];
};

export type CapabilityStageResult = {
  id: 'eligibility' | 'review' | 'grant' | 'execution';
  label: string;
  satisfied: boolean;
};

export type CapabilityEvaluation = {
  capabilityId: string;
  state: CapabilityState;
  eligible: boolean;
  reviewed: boolean;
  granted: boolean;
  active: boolean;
  suspended: boolean;
  expired: boolean;
  groupResults: EvidenceGroupResult[];
  missingEvidenceGroups: EvidenceGroupResult[];
  stages: CapabilityStageResult[];
  blockers: string[];
  ignoredAuthoritySignals: string[];
  junctionContext: string[];
  edgeContractRequired: boolean;
  explanation: string;
};

const STATE_EXPLANATIONS: Record<CapabilityState, string> = {
  INELIGIBLE: 'One or more action-specific eligibility evidence groups are not satisfied.',
  ELIGIBLE: 'Eligibility is satisfied. The capability is waiting for its required review.',
  REVIEWED: 'Eligibility and review are satisfied. The capability is waiting for its explicit bounded grant.',
  GRANTED: 'The bounded grant exists. Execution prerequisites are not yet complete.',
  ACTIVE: 'All registered evaluator predicates are satisfied for this action.',
  SUSPENDED: 'A bounded grant exists, but the capability is suspended.',
  EXPIRED: 'A bounded grant existed, but its validity window has expired.',
};

function evaluateEvidenceGroup(
  group: EvidenceGroup,
  evidence: Record<string, boolean>,
): EvidenceGroupResult {
  const satisfiedItems = group.items.filter((item) => evidence[item.id] === true).map((item) => item.id);
  const missingItems = group.items.filter((item) => evidence[item.id] !== true).map((item) => item.id);
  const satisfied =
    group.items.length === 0
      ? true
      : group.operator === 'all'
        ? missingItems.length === 0
        : satisfiedItems.length > 0;

  return {
    ...group,
    satisfied,
    satisfiedItems,
    missingItems,
  };
}

function parseTime(value: string | Date | undefined): number {
  if (!value) return Date.now();
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function getIgnoredAuthoritySignals(signals: ForbiddenAuthoritySignals | undefined): string[] {
  if (!signals) return [];
  const ignored: string[] = [];
  if (signals.currentVitaePosition) ignored.push('current Vitae navigation position');
  if (signals.gradeIndex) ignored.push('Grade index / face position');
  if (signals.achievementTitle) ignored.push('Architect / Wizard / Magus title display');
  if (signals.geometryAlignment) ignored.push('icosahedron / junction / ARCnet geometric alignment');
  return ignored;
}

export function createEmptyCapabilityFacts(policy: CapabilityPolicy): CapabilityFacts {
  const evidence: Record<string, boolean> = {};
  for (const group of policy.evidenceGroups) {
    for (const item of group.items) {
      evidence[item.id] = false;
    }
  }

  return {
    evidence,
    reviewPassed: false,
    explicitGrant: false,
    actionRegistered: false,
    destinationAccepted: false,
    suspended: false,
    expiresAt: null,
    forbiddenSignals: {
      currentVitaePosition: false,
      gradeIndex: false,
      achievementTitle: false,
      geometryAlignment: false,
    },
  };
}

export function satisfyEligibilityEvidence(
  policy: CapabilityPolicy,
  facts: CapabilityFacts,
): CapabilityFacts {
  const evidence = { ...facts.evidence };
  for (const group of policy.evidenceGroups) {
    for (const item of group.items) {
      evidence[item.id] = true;
    }
  }
  return { ...facts, evidence };
}

export function evaluateCapability(
  policy: CapabilityPolicy,
  facts: CapabilityFacts,
): CapabilityEvaluation {
  const groupResults = policy.evidenceGroups.map((group) =>
    evaluateEvidenceGroup(group, facts.evidence),
  );
  const missingEvidenceGroups = groupResults.filter((group) => !group.satisfied);
  const eligible = missingEvidenceGroups.length === 0;

  const reviewed = eligible && (!policy.review.required || facts.reviewPassed);
  const granted = reviewed && (!policy.grant.required || facts.explicitGrant);

  const evaluatedAt = parseTime(facts.evaluatedAt);
  const expiresAt = facts.expiresAt ? Date.parse(facts.expiresAt) : Number.NaN;
  const expired = granted && Number.isFinite(expiresAt) && evaluatedAt >= expiresAt;
  const suspended = granted && !expired && facts.suspended;

  const actionRegistered =
    !policy.execution.requiresRegisteredAction || facts.actionRegistered;
  const destinationAccepted =
    !policy.execution.requiresDestinationAcceptance || facts.destinationAccepted;
  const executionReady = granted && actionRegistered && destinationAccepted;

  let state: CapabilityState;
  if (!eligible) {
    state = 'INELIGIBLE';
  } else if (!reviewed) {
    state = 'ELIGIBLE';
  } else if (!granted) {
    state = 'REVIEWED';
  } else if (expired) {
    state = 'EXPIRED';
  } else if (suspended) {
    state = 'SUSPENDED';
  } else if (!executionReady) {
    state = 'GRANTED';
  } else {
    state = 'ACTIVE';
  }

  const blockers: string[] = [];
  for (const group of missingEvidenceGroups) {
    blockers.push(`Eligibility: ${group.label}`);
  }
  if (eligible && !reviewed) blockers.push(policy.review.label);
  if (reviewed && !granted) blockers.push(policy.grant.label);
  if (granted && !expired && !suspended && !actionRegistered) {
    blockers.push('Registered action is not available.');
  }
  if (granted && !expired && !suspended && !destinationAccepted) {
    blockers.push('Destination has not accepted the bounded action.');
  }
  if (suspended) blockers.push('Capability is suspended.');
  if (expired) blockers.push('Capability grant is expired.');

  const ignoredAuthoritySignals = getIgnoredAuthoritySignals(facts.forbiddenSignals);

  return {
    capabilityId: policy.id,
    state,
    eligible,
    reviewed,
    granted,
    active: state === 'ACTIVE',
    suspended,
    expired,
    groupResults,
    missingEvidenceGroups,
    stages: [
      { id: 'eligibility', label: 'Eligibility', satisfied: eligible },
      { id: 'review', label: 'Review', satisfied: reviewed },
      { id: 'grant', label: 'Grant', satisfied: granted },
      { id: 'execution', label: 'Execution', satisfied: executionReady && !suspended && !expired },
    ],
    blockers,
    ignoredAuthoritySignals,
    junctionContext: policy.junctionContext,
    edgeContractRequired: policy.edgeContractRequired,
    explanation: STATE_EXPLANATIONS[state],
  };
}
