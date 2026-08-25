import type { CapabilityPolicy, EvidenceKind } from './evaluator';

export const VERIFIABLE_CAPABILITY_STATES = [
  'INELIGIBLE',
  'ELIGIBLE',
  'REVIEWED',
  'GRANTED',
  'ACTIVE',
  'SUSPENDED',
  'REVOKED',
  'EXPIRED',
] as const;

export type VerifiableCapabilityState = (typeof VERIFIABLE_CAPABILITY_STATES)[number];

export type CapabilityRecordKind =
  | 'evidence'
  | 'review'
  | 'grant'
  | 'control'
  | 'action-registration'
  | 'destination-decision';

export type CapabilityTrustRole =
  | 'evidence-issuer'
  | 'reviewer'
  | 'grant-authority'
  | 'control-authority'
  | 'destination';

export type CapabilityScope = {
  capabilityId: string;
  system: CapabilityPolicy['system'];
  verb: string;
  resource: string;
  constraints: string[];
};

export type CapabilityRecordBase = {
  schema: 'arcanum.capability-record.v0.2';
  recordId: string;
  kind: CapabilityRecordKind;
  issuerId: string;
  subjectId: string;
  capability: CapabilityScope;
  policyDigest: string;
  issuedAt: string;
  notBefore: string | null;
  expiresAt: string | null;
};

export type EvidenceReceiptPayload = CapabilityRecordBase & {
  kind: 'evidence';
  evidenceKind: EvidenceKind;
  requirementId: string;
  assertion: 'satisfied';
  sourceReceiptIds: string[];
};

export type ReviewReceiptPayload = CapabilityRecordBase & {
  kind: 'review';
  outcome: 'passed' | 'failed';
  evidenceDigests: string[];
  authorityBasis: string;
};

export type GrantReceiptPayload = CapabilityRecordBase & {
  kind: 'grant';
  authorityBasis: string;
  evidenceSetDigest: string;
  reviewDigest: string | null;
  delegationChainIds: string[];
};

export type CapabilityControlPayload = CapabilityRecordBase & {
  kind: 'control';
  targetGrantId: string;
  targetGrantDigest: string;
  control: 'suspend' | 'resume' | 'revoke';
  effectiveAt: string;
  until: string | null;
  reasonCode: string;
  authorityBasis: string;
};

export type ActionRegistrationPayload = CapabilityRecordBase & {
  kind: 'action-registration';
  actionId: string;
  destinationSystem: CapabilityPolicy['system'];
  handlerVersion: string;
  executionContractDigest: string;
  status: 'registered';
};

export type DestinationDecisionPayload = CapabilityRecordBase & {
  kind: 'destination-decision';
  actionRequestId: string;
  actionId: string;
  decision: 'accepted' | 'rejected';
  evidenceSetDigest: string;
  reviewDigest: string | null;
  grantDigest: string | null;
  decisionBasis: string;
};

export type CapabilityRecordPayload =
  | EvidenceReceiptPayload
  | ReviewReceiptPayload
  | GrantReceiptPayload
  | CapabilityControlPayload
  | ActionRegistrationPayload
  | DestinationDecisionPayload;

export type CapabilityRecordProof = {
  alg: 'ES256';
  keyId: string;
  keyFingerprint: string;
  payloadDigest: string;
  signature: string;
};

export type SignedCapabilityRecord<TPayload extends CapabilityRecordPayload = CapabilityRecordPayload> = {
  payload: TPayload;
  proof: CapabilityRecordProof;
};

export type CapabilityTrustAnchor = {
  issuerId: string;
  keyId: string;
  alg: 'ES256';
  keyFingerprint: string;
  publicKeyJwk: JsonWebKey;
  roles: CapabilityTrustRole[];
  capabilityIds: string[];
  systems: CapabilityPolicy['system'][];
};

export type CapabilitySigner = {
  issuerId: string;
  keyId: string;
  privateKey: CryptoKey;
  anchor: CapabilityTrustAnchor;
};

export type RecordTemporalStatus = 'current' | 'not-yet-valid' | 'expired' | 'invalid-time';

export type CapabilityRecordCheck = {
  recordId: string;
  kind: CapabilityRecordKind;
  issuerId: string;
  digest: string;
  requiredRole: CapabilityTrustRole;
  integrityValid: boolean;
  temporalStatus: RecordTemporalStatus;
  usable: boolean;
  errors: string[];
  record: SignedCapabilityRecord;
};

export type VerifiableEvidenceGroupResult = {
  id: string;
  label: string;
  kind: EvidenceKind;
  operator: 'all' | 'any';
  satisfied: boolean;
  satisfiedRequirementIds: string[];
  missingRequirementIds: string[];
  selectedReceiptDigests: string[];
};

export type VerifiableCapabilityEvaluation = {
  capabilityId: string;
  policyDigest: string;
  subjectId: string;
  actionRequestId: string;
  state: VerifiableCapabilityState;
  eligible: boolean;
  reviewed: boolean;
  authoritySatisfied: boolean;
  active: boolean;
  suspended: boolean;
  revoked: boolean;
  expired: boolean;
  evidenceSetDigest: string;
  evidenceGroups: VerifiableEvidenceGroupResult[];
  selectedEvidenceDigests: string[];
  selectedReviewDigest: string | null;
  selectedGrantDigest: string | null;
  selectedActionRegistrationDigest: string | null;
  selectedDestinationDecisionDigest: string | null;
  blockers: string[];
  records: CapabilityRecordCheck[];
  nonAuthorizingInputs: string[];
  explanation: string;
};

export type VerifiableCapabilityInput = {
  subjectId: string;
  actionRequestId: string;
  trustAnchors: CapabilityTrustAnchor[];
  records: SignedCapabilityRecord[];
  evaluatedAt?: string | Date;
};

const ROLE_BY_KIND: Record<CapabilityRecordKind, CapabilityTrustRole> = {
  evidence: 'evidence-issuer',
  review: 'reviewer',
  grant: 'grant-authority',
  control: 'control-authority',
  'action-registration': 'destination',
  'destination-decision': 'destination',
};

const STATE_EXPLANATIONS: Record<VerifiableCapabilityState, string> = {
  INELIGIBLE: 'Required eligibility evidence is missing, invalid, out of scope, expired, or untrusted.',
  ELIGIBLE: 'Action-specific eligibility is satisfied; a required signed review is still pending.',
  REVIEWED: 'Eligibility and review are satisfied; a required bounded grant is still pending.',
  GRANTED: 'The authority basis is satisfied; destination-owned execution prerequisites are incomplete.',
  ACTIVE: 'All current signed records, trust anchors, policy bindings, lifecycle controls, and destination checks are satisfied.',
  SUSPENDED: 'A valid bounded grant exists, but the latest signed lifecycle control suspends it.',
  REVOKED: 'A valid bounded grant existed, but a signed lifecycle control has revoked it.',
  EXPIRED: 'A valid bounded grant existed, but its signed validity window has expired.',
};

const NON_AUTHORIZING_INPUTS = [
  'current Vitae navigation position',
  'Grade index or face illumination',
  'Architect / Wizard / Magus title display',
  'icosahedron, octahedron, junction, cube, or stella alignment',
];

function canonicalize(value: unknown): string {
  if (value === null) return 'null';

  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'boolean') return JSON.stringify(value);

  if (valueType === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Canonical JSON rejects non-finite numbers.');
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  }

  if (valueType === 'object') {
    const objectValue = value as Record<string, unknown>;
    const keys = Object.keys(objectValue).sort();
    return `{${keys
      .map((key) => {
        const item = objectValue[key];
        if (item === undefined) {
          throw new TypeError(`Canonical JSON rejects undefined at key "${key}".`);
        }
        return `${JSON.stringify(key)}:${canonicalize(item)}`;
      })
      .join(',')}}`;
  }

  throw new TypeError(`Canonical JSON rejects ${valueType}.`);
}

export function canonicalJson(value: unknown): string {
  return canonicalize(value);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function utf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function cryptoBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export async function digestCanonicalJson(value: unknown): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', cryptoBuffer(utf8(canonicalJson(value))));
  return `sha256:${bytesToBase64Url(new Uint8Array(hash))}`;
}

export async function fingerprintPublicJwk(jwk: JsonWebKey): Promise<string> {
  if (jwk.kty !== 'EC' || jwk.crv !== 'P-256' || !jwk.x || !jwk.y) {
    throw new TypeError('Only P-256 EC public JWKs are supported by capability-record v0.2.');
  }

  return digestCanonicalJson({
    crv: jwk.crv,
    kty: jwk.kty,
    x: jwk.x,
    y: jwk.y,
  });
}

export async function generateCapabilitySigner(input: {
  issuerId: string;
  keyId: string;
  roles: CapabilityTrustRole[];
  capabilityIds: string[];
  systems: CapabilityPolicy['system'][];
}): Promise<CapabilitySigner> {
  const keyPair = (await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  )) as CryptoKeyPair;

  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const keyFingerprint = await fingerprintPublicJwk(publicKeyJwk);

  return {
    issuerId: input.issuerId,
    keyId: input.keyId,
    privateKey: keyPair.privateKey,
    anchor: {
      issuerId: input.issuerId,
      keyId: input.keyId,
      alg: 'ES256',
      keyFingerprint,
      publicKeyJwk,
      roles: [...input.roles],
      capabilityIds: [...input.capabilityIds],
      systems: [...input.systems],
    },
  };
}

export async function signCapabilityRecord<TPayload extends CapabilityRecordPayload>(
  payload: TPayload,
  signer: CapabilitySigner,
): Promise<SignedCapabilityRecord<TPayload>> {
  if (payload.issuerId !== signer.issuerId) {
    throw new Error(`Payload issuer ${payload.issuerId} does not match signer ${signer.issuerId}.`);
  }

  const serialized = canonicalJson(payload);
  const payloadDigest = await digestCanonicalJson(payload);
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    signer.privateKey,
    cryptoBuffer(utf8(serialized)),
  );

  return {
    payload,
    proof: {
      alg: 'ES256',
      keyId: signer.keyId,
      keyFingerprint: signer.anchor.keyFingerprint,
      payloadDigest,
      signature: bytesToBase64Url(new Uint8Array(signature)),
    },
  };
}

function parseTimestamp(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function evaluatedAtMs(value: string | Date | undefined): number {
  if (!value) return Date.now();
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function temporalStatus(payload: CapabilityRecordPayload, atMs: number): RecordTemporalStatus {
  const issuedAt = parseTimestamp(payload.issuedAt);
  const notBefore = parseTimestamp(payload.notBefore);
  const expiresAt = parseTimestamp(payload.expiresAt);

  if (issuedAt === null || (payload.notBefore !== null && notBefore === null) || (payload.expiresAt !== null && expiresAt === null)) {
    return 'invalid-time';
  }
  if (issuedAt > atMs || (notBefore !== null && notBefore > atMs)) return 'not-yet-valid';
  if (expiresAt !== null && atMs >= expiresAt) return 'expired';
  return 'current';
}

function recordBindingErrors(
  record: SignedCapabilityRecord,
  policy: CapabilityPolicy,
  policyDigest: string,
  subjectId: string,
): string[] {
  const payload = record.payload;
  const errors: string[] = [];

  if (payload.schema !== 'arcanum.capability-record.v0.2') {
    errors.push('Unsupported capability record schema.');
  }
  if (!payload.recordId.trim()) errors.push('Record ID is required.');
  if (!payload.issuerId.trim()) errors.push('Issuer ID is required.');
  if (!payload.subjectId.trim()) errors.push('Subject ID is required.');
  if (payload.subjectId !== subjectId) errors.push('Subject binding mismatch.');
  if (payload.policyDigest !== policyDigest) errors.push('Policy digest mismatch.');
  if (payload.capability.capabilityId !== policy.id) errors.push('Capability ID scope mismatch.');
  if (payload.capability.system !== policy.system) errors.push('Destination system scope mismatch.');
  if (payload.capability.verb !== policy.verb) errors.push('Capability verb scope mismatch.');
  if (!payload.capability.resource.trim()) errors.push('Capability resource scope is required.');

  if (payload.kind === 'evidence') {
    if (!payload.requirementId.trim()) errors.push('Evidence requirement ID is required.');
    if (payload.sourceReceiptIds.length === 0) errors.push('Evidence must cite at least one source receipt ID.');
  }
  if (payload.kind === 'review' && !payload.authorityBasis.trim()) {
    errors.push('Review authority basis is required.');
  }
  if (payload.kind === 'grant' && !payload.authorityBasis.trim()) {
    errors.push('Grant authority basis is required.');
  }
  if (payload.kind === 'control') {
    if (!payload.authorityBasis.trim()) errors.push('Control authority basis is required.');
    if (!payload.reasonCode.trim()) errors.push('Control reason code is required.');
  }
  if (payload.kind === 'action-registration') {
    if (!payload.actionId.trim()) errors.push('Registered action ID is required.');
    if (!payload.executionContractDigest.trim()) errors.push('Execution contract digest is required.');
  }
  if (payload.kind === 'destination-decision') {
    if (!payload.actionRequestId.trim()) errors.push('Action request ID is required.');
    if (!payload.decisionBasis.trim()) errors.push('Destination decision basis is required.');
  }

  return errors;
}

export async function inspectCapabilityRecord(
  record: SignedCapabilityRecord,
  policy: CapabilityPolicy,
  policyDigest: string,
  subjectId: string,
  trustAnchors: CapabilityTrustAnchor[],
  atMs: number,
): Promise<CapabilityRecordCheck> {
  const errors = recordBindingErrors(record, policy, policyDigest, subjectId);
  const requiredRole = ROLE_BY_KIND[record.payload.kind];
  let digest = '';

  try {
    digest = await digestCanonicalJson(record.payload);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unable to digest payload.');
  }

  if (record.proof.alg !== 'ES256') errors.push('Unsupported proof algorithm.');
  if (digest && record.proof.payloadDigest !== digest) errors.push('Payload digest does not match proof.');

  const anchor = trustAnchors.find(
    (candidate) =>
      candidate.issuerId === record.payload.issuerId &&
      candidate.keyId === record.proof.keyId &&
      candidate.keyFingerprint === record.proof.keyFingerprint,
  );

  if (!anchor) {
    errors.push('No matching trusted issuer anchor.');
  } else {
    if (anchor.alg !== 'ES256') errors.push('Trust anchor algorithm mismatch.');
    if (!anchor.roles.includes(requiredRole)) {
      errors.push(`Issuer anchor lacks required role ${requiredRole}.`);
    }
    if (anchor.capabilityIds.length > 0 && !anchor.capabilityIds.includes(policy.id)) {
      errors.push('Issuer anchor is not trusted for this capability.');
    }
    if (anchor.systems.length > 0 && !anchor.systems.includes(policy.system)) {
      errors.push('Issuer anchor is not trusted for this system.');
    }

    try {
      const importedKey = await crypto.subtle.importKey(
        'jwk',
        anchor.publicKeyJwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['verify'],
      );
      const verified = await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        importedKey,
        cryptoBuffer(base64UrlToBytes(record.proof.signature)),
        cryptoBuffer(utf8(canonicalJson(record.payload))),
      );
      if (!verified) errors.push('Cryptographic signature verification failed.');
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Cryptographic signature verification failed.');
    }
  }

  const timeStatus = temporalStatus(record.payload, atMs);
  if (timeStatus === 'invalid-time') errors.push('Record contains an invalid timestamp.');
  if (timeStatus === 'not-yet-valid') errors.push('Record is not yet valid.');

  const integrityValid = errors.length === 0;
  const usable = integrityValid && timeStatus === 'current';

  return {
    recordId: record.payload.recordId,
    kind: record.payload.kind,
    issuerId: record.payload.issuerId,
    digest,
    requiredRole,
    integrityValid,
    temporalStatus: timeStatus,
    usable,
    errors,
    record,
  };
}

function newest<T extends CapabilityRecordCheck>(records: T[], timeSelector: (record: T) => number): T | null {
  if (records.length === 0) return null;
  return [...records].sort((a, b) => {
    const timeDifference = timeSelector(b) - timeSelector(a);
    if (timeDifference !== 0) return timeDifference;
    return b.recordId.localeCompare(a.recordId);
  })[0];
}

function recordIssuedAt(check: CapabilityRecordCheck): number {
  return Date.parse(check.record.payload.issuedAt);
}

function controlEffectiveAt(check: CapabilityRecordCheck): number {
  if (check.record.payload.kind !== 'control') return Number.NEGATIVE_INFINITY;
  return Date.parse(check.record.payload.effectiveAt);
}

function latestEvidenceForRequirement(
  checks: CapabilityRecordCheck[],
  requirementId: string,
  evidenceKind: EvidenceKind,
): CapabilityRecordCheck | null {
  return newest(
    checks.filter((check) => {
      if (!check.usable || check.record.payload.kind !== 'evidence') return false;
      const payload = check.record.payload;
      return (
        payload.requirementId === requirementId &&
        payload.evidenceKind === evidenceKind &&
        payload.assertion === 'satisfied'
      );
    }),
    recordIssuedAt,
  );
}

function hasAll(values: string[], expected: string[]): boolean {
  const valueSet = new Set(values);
  return expected.every((value) => valueSet.has(value));
}

export async function evaluateVerifiableCapability(
  policy: CapabilityPolicy,
  input: VerifiableCapabilityInput,
): Promise<VerifiableCapabilityEvaluation> {
  const policyDigest = await digestCanonicalJson(policy);
  const atMs = evaluatedAtMs(input.evaluatedAt);
  const records = await Promise.all(
    input.records.map((record) =>
      inspectCapabilityRecord(
        record,
        policy,
        policyDigest,
        input.subjectId,
        input.trustAnchors,
        atMs,
      ),
    ),
  );

  const selectedEvidence: CapabilityRecordCheck[] = [];
  const evidenceGroups: VerifiableEvidenceGroupResult[] = policy.evidenceGroups.map((group) => {
    const candidates = group.items.map((item) => ({
      item,
      check: latestEvidenceForRequirement(records, item.id, group.kind),
    }));

    let selected = candidates.filter((candidate) => candidate.check !== null);
    if (group.operator === 'any' && selected.length > 1) selected = selected.slice(0, 1);

    const satisfiedRequirementIds = selected.map((candidate) => candidate.item.id);
    const missingRequirementIds =
      group.operator === 'all'
        ? candidates.filter((candidate) => candidate.check === null).map((candidate) => candidate.item.id)
        : selected.length > 0
          ? []
          : candidates.map((candidate) => candidate.item.id);

    const satisfied =
      group.items.length === 0 ||
      (group.operator === 'all' ? missingRequirementIds.length === 0 : selected.length > 0);

    for (const candidate of selected) {
      if (candidate.check && !selectedEvidence.some((existing) => existing.digest === candidate.check?.digest)) {
        selectedEvidence.push(candidate.check);
      }
    }

    return {
      id: group.id,
      label: group.label,
      kind: group.kind,
      operator: group.operator,
      satisfied,
      satisfiedRequirementIds,
      missingRequirementIds,
      selectedReceiptDigests: selected
        .map((candidate) => candidate.check?.digest ?? '')
        .filter(Boolean),
    };
  });

  const eligible = evidenceGroups.every((group) => group.satisfied);
  const selectedEvidenceDigests = selectedEvidence.map((check) => check.digest).sort();
  const evidenceSetDigest = await digestCanonicalJson({ evidenceDigests: selectedEvidenceDigests });

  const reviewCandidates = records.filter((check) => {
    if (!check.usable || check.record.payload.kind !== 'review') return false;
    return hasAll(check.record.payload.evidenceDigests, selectedEvidenceDigests);
  });
  const selectedReview = newest(reviewCandidates, recordIssuedAt);
  const reviewed =
    eligible &&
    (!policy.review.required ||
      (selectedReview !== null &&
        selectedReview.record.payload.kind === 'review' &&
        selectedReview.record.payload.outcome === 'passed'));

  const selectedReviewDigest =
    reviewed && policy.review.required && selectedReview ? selectedReview.digest : null;

  const grantCandidates = records.filter((check) => {
    if (!check.integrityValid || check.record.payload.kind !== 'grant') return false;
    if (check.temporalStatus === 'invalid-time' || check.temporalStatus === 'not-yet-valid') return false;
    const payload = check.record.payload;
    return (
      payload.evidenceSetDigest === evidenceSetDigest &&
      payload.reviewDigest === (policy.review.required ? selectedReviewDigest : null)
    );
  });
  const selectedGrant = newest(grantCandidates, recordIssuedAt);
  const selectedGrantDigest = policy.grant.required && selectedGrant ? selectedGrant.digest : null;
  const grantExpired =
    policy.grant.required && selectedGrant !== null && selectedGrant.temporalStatus === 'expired';
  const authoritySatisfied =
    reviewed && (!policy.grant.required || selectedGrant !== null);

  let suspended = false;
  let revoked = false;

  if (policy.grant.required && selectedGrant && selectedGrant.record.payload.kind === 'grant') {
    const controlCandidates = records.filter((check) => {
      if (!check.usable || check.record.payload.kind !== 'control') return false;
      const payload = check.record.payload;
      const effectiveAt = parseTimestamp(payload.effectiveAt);
      return (
        payload.targetGrantId === selectedGrant.record.payload.recordId &&
        payload.targetGrantDigest === selectedGrant.digest &&
        effectiveAt !== null &&
        effectiveAt <= atMs
      );
    });
    const latestControl = newest(controlCandidates, controlEffectiveAt);
    if (latestControl?.record.payload.kind === 'control') {
      const payload = latestControl.record.payload;
      if (payload.control === 'revoke') {
        revoked = true;
      } else if (payload.control === 'suspend') {
        const until = parseTimestamp(payload.until);
        suspended = until === null || atMs < until;
      }
    }
  }

  const actionRegistrationCandidates = records.filter((check) => {
    if (!check.usable || check.record.payload.kind !== 'action-registration') return false;
    return (
      check.record.payload.status === 'registered' &&
      check.record.payload.destinationSystem === policy.system
    );
  });
  const selectedActionRegistration = newest(actionRegistrationCandidates, recordIssuedAt);
  const actionRegistered =
    !policy.execution.requiresRegisteredAction || selectedActionRegistration !== null;

  const selectedActionId =
    selectedActionRegistration?.record.payload.kind === 'action-registration'
      ? selectedActionRegistration.record.payload.actionId
      : null;

  const destinationDecisionCandidates = records.filter((check) => {
    if (!check.usable || check.record.payload.kind !== 'destination-decision') return false;
    const payload = check.record.payload;
    return (
      payload.actionRequestId === input.actionRequestId &&
      (selectedActionId === null || payload.actionId === selectedActionId) &&
      payload.evidenceSetDigest === evidenceSetDigest &&
      payload.reviewDigest === (policy.review.required ? selectedReviewDigest : null) &&
      payload.grantDigest === (policy.grant.required ? selectedGrantDigest : null)
    );
  });
  const selectedDestinationDecision = newest(destinationDecisionCandidates, recordIssuedAt);
  const destinationAccepted =
    !policy.execution.requiresDestinationAcceptance ||
    (selectedDestinationDecision?.record.payload.kind === 'destination-decision' &&
      selectedDestinationDecision.record.payload.decision === 'accepted');

  const executionReady = authoritySatisfied && actionRegistered && destinationAccepted;

  let state: VerifiableCapabilityState;
  if (!eligible) {
    state = 'INELIGIBLE';
  } else if (!reviewed) {
    state = 'ELIGIBLE';
  } else if (!authoritySatisfied) {
    state = 'REVIEWED';
  } else if (revoked) {
    state = 'REVOKED';
  } else if (grantExpired) {
    state = 'EXPIRED';
  } else if (suspended) {
    state = 'SUSPENDED';
  } else if (!executionReady) {
    state = 'GRANTED';
  } else {
    state = 'ACTIVE';
  }

  const blockers: string[] = [];
  for (const group of evidenceGroups) {
    if (!group.satisfied) blockers.push(`Eligibility: ${group.label}`);
  }
  if (eligible && !reviewed) blockers.push(policy.review.label);
  if (reviewed && !authoritySatisfied) blockers.push(policy.grant.label);
  if (revoked) blockers.push('The selected grant has been revoked by a trusted signed control record.');
  if (grantExpired) blockers.push('The selected grant has expired.');
  if (suspended) blockers.push('The selected grant is suspended by the latest trusted signed control record.');
  if (authoritySatisfied && !revoked && !grantExpired && !suspended && !actionRegistered) {
    blockers.push('No current destination-signed action registration is available.');
  }
  if (authoritySatisfied && !revoked && !grantExpired && !suspended && !destinationAccepted) {
    const rejected =
      selectedDestinationDecision?.record.payload.kind === 'destination-decision' &&
      selectedDestinationDecision.record.payload.decision === 'rejected';
    blockers.push(
      rejected
        ? 'The destination explicitly rejected this action request.'
        : 'No current destination-signed acceptance exists for this action request.',
    );
  }

  return {
    capabilityId: policy.id,
    policyDigest,
    subjectId: input.subjectId,
    actionRequestId: input.actionRequestId,
    state,
    eligible,
    reviewed,
    authoritySatisfied,
    active: state === 'ACTIVE',
    suspended,
    revoked,
    expired: grantExpired,
    evidenceSetDigest,
    evidenceGroups,
    selectedEvidenceDigests,
    selectedReviewDigest,
    selectedGrantDigest,
    selectedActionRegistrationDigest: selectedActionRegistration?.digest ?? null,
    selectedDestinationDecisionDigest: selectedDestinationDecision?.digest ?? null,
    blockers,
    records,
    nonAuthorizingInputs: [...NON_AUTHORIZING_INPUTS],
    explanation: STATE_EXPLANATIONS[state],
  };
}
