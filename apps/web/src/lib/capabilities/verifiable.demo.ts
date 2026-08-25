import type { CapabilityPolicy, EvidenceGroup } from './evaluator';
import {
  digestCanonicalJson,
  generateCapabilitySigner,
  signCapabilityRecord,
  type ActionRegistrationPayload,
  type CapabilityControlPayload,
  type CapabilityScope,
  type CapabilityTrustAnchor,
  type DestinationDecisionPayload,
  type EvidenceReceiptPayload,
  type GrantReceiptPayload,
  type ReviewReceiptPayload,
  type SignedCapabilityRecord,
} from './verifiable';

export const VERIFIABLE_DEMO_MODES = [
  'empty',
  'eligible',
  'reviewed',
  'granted',
  'active',
  'suspended',
  'revoked',
  'expired',
  'tampered',
] as const;

export type VerifiableDemoMode = (typeof VERIFIABLE_DEMO_MODES)[number];

export type VerifiableCapabilityDemoHarness = {
  subjectId: string;
  actionRequestId: string;
  policyDigest: string;
  trustAnchors: CapabilityTrustAnchor[];
  recordsByMode: Record<VerifiableDemoMode, SignedCapabilityRecord[]>;
};

function isoOffset(baseMs: number, offsetMs: number): string {
  return new Date(baseMs + offsetMs).toISOString();
}

function scopeFor(policy: CapabilityPolicy): CapabilityScope {
  return {
    capabilityId: policy.id,
    system: policy.system,
    verb: policy.verb,
    resource: `demo://${policy.system}/${policy.id}`,
    constraints: ['action-specific', 'non-transferable-demo-subject', 'geometry-non-authorizing'],
  };
}

function requirementEntries(policy: CapabilityPolicy): Array<{
  group: EvidenceGroup;
  item: EvidenceGroup['items'][number];
}> {
  return policy.evidenceGroups.flatMap((group) =>
    group.items.map((item) => ({ group, item })),
  );
}

function requiredRecords<T extends SignedCapabilityRecord>(
  condition: boolean,
  record: T,
): T[] {
  return condition ? [record] : [];
}

export async function createVerifiableCapabilityDemoHarness(
  policy: CapabilityPolicy,
): Promise<VerifiableCapabilityDemoHarness> {
  const now = Date.now();
  const issuedAt = isoOffset(now, -5 * 60_000);
  const expiresAt = isoOffset(now, 24 * 60 * 60_000);
  const subjectId = 'identity:demo-sovereign-participant';
  const actionRequestId = `demo-request:${policy.id}`;
  const policyDigest = await digestCanonicalJson(policy);
  const capability = scopeFor(policy);

  const evidenceSigner = await generateCapabilitySigner({
    issuerId: `demo:${policy.system}:evidence-issuer`,
    keyId: `demo:${policy.id}:evidence-key`,
    roles: ['evidence-issuer'],
    capabilityIds: [policy.id],
    systems: [policy.system],
  });
  const reviewerSigner = await generateCapabilitySigner({
    issuerId: `demo:${policy.system}:reviewer`,
    keyId: `demo:${policy.id}:review-key`,
    roles: ['reviewer'],
    capabilityIds: [policy.id],
    systems: [policy.system],
  });
  const authoritySigner = await generateCapabilitySigner({
    issuerId: `demo:${policy.system}:authority`,
    keyId: `demo:${policy.id}:authority-key`,
    roles: ['grant-authority', 'control-authority'],
    capabilityIds: [policy.id],
    systems: [policy.system],
  });
  const destinationSigner = await generateCapabilitySigner({
    issuerId: `demo:${policy.system}:destination`,
    keyId: `demo:${policy.id}:destination-key`,
    roles: ['destination'],
    capabilityIds: [policy.id],
    systems: [policy.system],
  });

  const evidenceRecords: SignedCapabilityRecord[] = [];
  for (const { group, item } of requirementEntries(policy)) {
    const payload: EvidenceReceiptPayload = {
      schema: 'arcanum.capability-record.v0.2',
      recordId: `demo-evidence:${policy.id}:${item.id}`,
      kind: 'evidence',
      issuerId: evidenceSigner.issuerId,
      subjectId,
      capability,
      policyDigest,
      issuedAt,
      notBefore: issuedAt,
      expiresAt,
      evidenceKind: group.kind,
      requirementId: item.id,
      assertion: 'satisfied',
      sourceReceiptIds: [`demo-source:${item.id}`],
    };
    evidenceRecords.push(await signCapabilityRecord(payload, evidenceSigner));
  }

  const evidenceByRequirement = new Map(
    evidenceRecords.map((record) => [
      record.payload.kind === 'evidence' ? record.payload.requirementId : '',
      record,
    ]),
  );
  const selectedEvidenceRecords = policy.evidenceGroups.flatMap((group) => {
    if (group.items.length === 0) return [];
    const selectedItems = group.operator === 'any' ? group.items.slice(0, 1) : group.items;
    return selectedItems
      .map((item) => evidenceByRequirement.get(item.id))
      .filter((record): record is SignedCapabilityRecord => Boolean(record));
  });
  const evidenceDigests = selectedEvidenceRecords
    .map((record) => record.proof.payloadDigest)
    .sort();
  const evidenceSetDigest = await digestCanonicalJson({ evidenceDigests });

  const reviewPayload: ReviewReceiptPayload = {
    schema: 'arcanum.capability-record.v0.2',
    recordId: `demo-review:${policy.id}`,
    kind: 'review',
    issuerId: reviewerSigner.issuerId,
    subjectId,
    capability,
    policyDigest,
    issuedAt: isoOffset(now, -4 * 60_000),
    notBefore: isoOffset(now, -4 * 60_000),
    expiresAt,
    outcome: 'passed',
    evidenceDigests,
    authorityBasis: `demo-review-policy:${policy.id}`,
  };
  const reviewRecord = await signCapabilityRecord(reviewPayload, reviewerSigner);
  const reviewDigest = policy.review.required ? reviewRecord.proof.payloadDigest : null;

  const grantPayload: GrantReceiptPayload = {
    schema: 'arcanum.capability-record.v0.2',
    recordId: `demo-grant:${policy.id}`,
    kind: 'grant',
    issuerId: authoritySigner.issuerId,
    subjectId,
    capability,
    policyDigest,
    issuedAt: isoOffset(now, -3 * 60_000),
    notBefore: isoOffset(now, -3 * 60_000),
    expiresAt,
    authorityBasis: `demo-explicit-delegation:${policy.id}`,
    evidenceSetDigest,
    reviewDigest,
    delegationChainIds: [`demo-delegation-root:${policy.system}`],
  };
  const grantRecord = await signCapabilityRecord(grantPayload, authoritySigner);
  const grantDigest = policy.grant.required ? grantRecord.proof.payloadDigest : null;

  const actionRegistrationPayload: ActionRegistrationPayload = {
    schema: 'arcanum.capability-record.v0.2',
    recordId: `demo-action-registration:${policy.id}`,
    kind: 'action-registration',
    issuerId: destinationSigner.issuerId,
    subjectId,
    capability,
    policyDigest,
    issuedAt: isoOffset(now, -2 * 60_000),
    notBefore: isoOffset(now, -2 * 60_000),
    expiresAt,
    actionId: `demo-action:${policy.id}`,
    destinationSystem: policy.system,
    handlerVersion: 'demo-handler-v0.2',
    executionContractDigest: await digestCanonicalJson({
      capabilityId: policy.id,
      verb: policy.verb,
      destinationSystem: policy.system,
      version: '0.2',
    }),
    status: 'registered',
  };
  const actionRegistrationRecord = await signCapabilityRecord(
    actionRegistrationPayload,
    destinationSigner,
  );

  const destinationDecisionPayload: DestinationDecisionPayload = {
    schema: 'arcanum.capability-record.v0.2',
    recordId: `demo-destination-decision:${policy.id}`,
    kind: 'destination-decision',
    issuerId: destinationSigner.issuerId,
    subjectId,
    capability,
    policyDigest,
    issuedAt: isoOffset(now, -60_000),
    notBefore: isoOffset(now, -60_000),
    expiresAt,
    actionRequestId,
    actionId: actionRegistrationPayload.actionId,
    decision: 'accepted',
    evidenceSetDigest,
    reviewDigest,
    grantDigest,
    decisionBasis: `demo-destination-contract:${policy.id}`,
  };
  const destinationDecisionRecord = await signCapabilityRecord(
    destinationDecisionPayload,
    destinationSigner,
  );

  const suspensionPayload: CapabilityControlPayload = {
    schema: 'arcanum.capability-record.v0.2',
    recordId: `demo-control:suspend:${policy.id}`,
    kind: 'control',
    issuerId: authoritySigner.issuerId,
    subjectId,
    capability,
    policyDigest,
    issuedAt: isoOffset(now, -30_000),
    notBefore: isoOffset(now, -30_000),
    expiresAt: null,
    targetGrantId: grantPayload.recordId,
    targetGrantDigest: grantRecord.proof.payloadDigest,
    control: 'suspend',
    effectiveAt: isoOffset(now, -30_000),
    until: null,
    reasonCode: 'demo-suspension',
    authorityBasis: `demo-control-authority:${policy.id}`,
  };
  const suspensionRecord = await signCapabilityRecord(suspensionPayload, authoritySigner);

  const revocationPayload: CapabilityControlPayload = {
    ...suspensionPayload,
    recordId: `demo-control:revoke:${policy.id}`,
    issuedAt: isoOffset(now, -20_000),
    notBefore: isoOffset(now, -20_000),
    control: 'revoke',
    effectiveAt: isoOffset(now, -20_000),
    reasonCode: 'demo-revocation',
  };
  const revocationRecord = await signCapabilityRecord(revocationPayload, authoritySigner);

  const expiredGrantPayload: GrantReceiptPayload = {
    ...grantPayload,
    recordId: `demo-grant:expired:${policy.id}`,
    issuedAt: isoOffset(now, -10 * 60_000),
    notBefore: isoOffset(now, -10 * 60_000),
    expiresAt: isoOffset(now, -60_000),
  };
  const expiredGrantRecord = await signCapabilityRecord(expiredGrantPayload, authoritySigner);
  const expiredGrantDigest = policy.grant.required
    ? expiredGrantRecord.proof.payloadDigest
    : null;

  const expiredDecisionPayload: DestinationDecisionPayload = {
    ...destinationDecisionPayload,
    recordId: `demo-destination-decision:expired-grant:${policy.id}`,
    issuedAt: isoOffset(now, -90_000),
    notBefore: isoOffset(now, -90_000),
    grantDigest: expiredGrantDigest,
  };
  const expiredDecisionRecord = await signCapabilityRecord(
    expiredDecisionPayload,
    destinationSigner,
  );

  const requiredReview = requiredRecords(policy.review.required, reviewRecord);
  const requiredGrant = requiredRecords(policy.grant.required, grantRecord);
  const requiredActionRegistration = requiredRecords(
    policy.execution.requiresRegisteredAction,
    actionRegistrationRecord,
  );
  const requiredDestinationDecision = requiredRecords(
    policy.execution.requiresDestinationAcceptance,
    destinationDecisionRecord,
  );

  const reviewedRecords = [...evidenceRecords, ...requiredReview];
  const grantedRecords = [...reviewedRecords, ...requiredGrant];
  const activeRecords = [
    ...grantedRecords,
    ...requiredActionRegistration,
    ...requiredDestinationDecision,
  ];

  const tamperedEvidence = evidenceRecords.map((record, index) => ({
    ...record,
    payload: {
      ...record.payload,
      recordId: `${record.payload.recordId}:tampered:${index}`,
    },
  })) as SignedCapabilityRecord[];

  const expiredRecords = [
    ...reviewedRecords,
    ...requiredRecords(policy.grant.required, expiredGrantRecord),
    ...requiredActionRegistration,
    ...requiredRecords(
      policy.execution.requiresDestinationAcceptance,
      policy.grant.required ? expiredDecisionRecord : destinationDecisionRecord,
    ),
  ];

  return {
    subjectId,
    actionRequestId,
    policyDigest,
    trustAnchors: [
      evidenceSigner.anchor,
      reviewerSigner.anchor,
      authoritySigner.anchor,
      destinationSigner.anchor,
    ],
    recordsByMode: {
      empty: [],
      eligible: evidenceRecords,
      reviewed: reviewedRecords,
      granted: grantedRecords,
      active: activeRecords,
      suspended: policy.grant.required ? [...activeRecords, suspensionRecord] : activeRecords,
      revoked: policy.grant.required ? [...activeRecords, revocationRecord] : activeRecords,
      expired: expiredRecords,
      tampered: [
        ...tamperedEvidence,
        ...requiredReview,
        ...requiredGrant,
        ...requiredActionRegistration,
        ...requiredDestinationDecision,
      ],
    },
  };
}
