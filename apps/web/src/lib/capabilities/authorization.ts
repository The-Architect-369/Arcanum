import {
  evaluateCapability,
  type CapabilityEvaluation,
  type CapabilityPolicy,
  type EvidenceKind,
} from './evaluator';
import { canonicalJson, digestCanonical } from './digest';

export type SignatureEnvelope = {
  algorithm: 'ed25519';
  keyId: string;
  value: string;
};

export type AuthorizationRecordType =
  | 'evidence-receipt'
  | 'review-receipt'
  | 'capability-grant'
  | 'execution-receipt'
  | 'suspension-receipt'
  | 'revocation-receipt';

type AuthorizationRecordBase = {
  schemaVersion: 'arcnet.authorization.v0.2';
  recordType: AuthorizationRecordType;
  recordId: string;
  issuer: string;
  subject: string;
  capabilityId: string;
  policyDigest: string;
  issuedAt: string;
  contentDigest: string;
  signature: SignatureEnvelope;
};

export type EvidenceReceipt = AuthorizationRecordBase & {
  recordType: 'evidence-receipt';
  evidenceId: string;
  evidenceKind: EvidenceKind;
  scope: string;
  expiresAt: string | null;
};

export type ReviewReceipt = AuthorizationRecordBase & {
  recordType: 'review-receipt';
  outcome: 'passed' | 'failed';
  evidenceReceiptIds: string[];
  reviewScope: string;
};

export type CapabilityGrant = AuthorizationRecordBase & {
  recordType: 'capability-grant';
  authorityBasis: string;
  scope: string;
  reviewReceiptId: string | null;
  evidenceReceiptIds: string[];
  expiresAt: string | null;
};

export type ExecutionReceipt = AuthorizationRecordBase & {
  recordType: 'execution-receipt';
  actionId: string;
  destination: string;
  actionRegistered: boolean;
  destinationAccepted: boolean;
};

export type SuspensionReceipt = AuthorizationRecordBase & {
  recordType: 'suspension-receipt';
  status: 'suspended' | 'cleared';
  effectiveAt: string;
  reason: string;
};

export type RevocationReceipt = AuthorizationRecordBase & {
  recordType: 'revocation-receipt';
  effectiveAt: string;
  reason: string;
};

export type AuthorizationRecord =
  | EvidenceReceipt
  | ReviewReceipt
  | CapabilityGrant
  | ExecutionReceipt
  | SuspensionReceipt
  | RevocationReceipt;

export type CapabilityAuthorizationBundle = {
  subject: string;
  records: AuthorizationRecord[];
};

export type RecordVerifier = (
  record: AuthorizationRecord,
  canonicalUnsignedRecord: string,
) => boolean;

export type RecordDiagnostic = {
  recordId: string;
  recordType: AuthorizationRecordType;
  valid: boolean;
  reasons: string[];
};

export type CapabilityAuthorizationEvaluation = CapabilityEvaluation & {
  subject: string;
  policyDigest: string;
  validRecordIds: string[];
  selectedEvidenceReceiptIds: string[];
  reviewReceiptId: string | null;
  grantReceiptId: string | null;
  executionReceiptId: string | null;
  revoked: boolean;
  recordDiagnostics: RecordDiagnostic[];
};

type UnsignedRecord = Omit<AuthorizationRecord, 'contentDigest' | 'signature'>;

export function digestCapabilityPolicy(policy: CapabilityPolicy): string {
  return digestCanonical(policy);
}

export function unsignedAuthorizationRecord(record: AuthorizationRecord): UnsignedRecord {
  const { contentDigest: _contentDigest, signature: _signature, ...unsigned } = record;
  return unsigned as UnsignedRecord;
}

export function digestAuthorizationRecord(record: AuthorizationRecord): string {
  return digestCanonical(unsignedAuthorizationRecord(record));
}

function parseTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function isExpired(expiresAt: string | null, evaluatedAt: number): boolean {
  if (!expiresAt) return false;
  const parsed = parseTimestamp(expiresAt);
  return !Number.isFinite(parsed) || evaluatedAt >= parsed;
}

function diagnoseRecord(
  policy: CapabilityPolicy,
  subject: string,
  record: AuthorizationRecord,
  verifier: RecordVerifier,
): RecordDiagnostic {
  const reasons: string[] = [];
  const expectedPolicyDigest = digestCapabilityPolicy(policy);
  const unsigned = unsignedAuthorizationRecord(record);
  const canonical = canonicalJson(unsigned);

  if (record.schemaVersion !== 'arcnet.authorization.v0.2') reasons.push('unsupported schemaVersion');
  if (!record.recordId) reasons.push('missing recordId');
  if (!record.issuer) reasons.push('missing issuer');
  if (record.subject !== subject) reasons.push('subject mismatch');
  if (record.capabilityId !== policy.id) reasons.push('capability mismatch');
  if (record.policyDigest !== expectedPolicyDigest) reasons.push('policy digest mismatch');
  if (!Number.isFinite(parseTimestamp(record.issuedAt))) reasons.push('invalid issuedAt');
  if (record.contentDigest !== digestCanonical(unsigned)) reasons.push('content digest mismatch');
  if (!record.signature.keyId) reasons.push('missing signature keyId');
  if (!record.signature.value) reasons.push('missing signature value');
  if (reasons.length === 0 && !verifier(record, canonical)) reasons.push('signature verification failed');

  return {
    recordId: record.recordId,
    recordType: record.recordType,
    valid: reasons.length === 0,
    reasons,
  };
}

function latest<T extends AuthorizationRecord>(records: T[], timeField: (record: T) => string): T | null {
  return (
    [...records].sort((a, b) => parseTimestamp(timeField(b)) - parseTimestamp(timeField(a)))[0] ?? null
  );
}

export function evaluateCapabilityAuthorization(
  policy: CapabilityPolicy,
  bundle: CapabilityAuthorizationBundle,
  verifier: RecordVerifier,
  evaluatedAt: string | Date = new Date(),
): CapabilityAuthorizationEvaluation {
  const evaluatedAtMs = evaluatedAt instanceof Date ? evaluatedAt.getTime() : Date.parse(evaluatedAt);
  const now = Number.isFinite(evaluatedAtMs) ? evaluatedAtMs : Date.now();
  const diagnostics = bundle.records.map((record) => diagnoseRecord(policy, bundle.subject, record, verifier));
  const validIds = new Set(diagnostics.filter((item) => item.valid).map((item) => item.recordId));
  const validRecords = bundle.records.filter((record) => validIds.has(record.recordId));

  const evidenceReceipts = validRecords.filter(
    (record): record is EvidenceReceipt => record.recordType === 'evidence-receipt' && !isExpired(record.expiresAt, now),
  );
  const evidence: Record<string, boolean> = {};
  const selectedEvidenceReceiptIds: string[] = [];

  for (const group of policy.evidenceGroups) {
    const matching = group.items.map((item) => ({
      item,
      receipt: latest(
        evidenceReceipts.filter(
          (record) => record.evidenceId === item.id && record.evidenceKind === group.kind,
        ),
        (record) => record.issuedAt,
      ),
    }));

    for (const match of matching) evidence[match.item.id] = Boolean(match.receipt);
    const chosen =
      group.operator === 'all'
        ? matching.map((match) => match.receipt).filter((record): record is EvidenceReceipt => Boolean(record))
        : matching.find((match) => Boolean(match.receipt))?.receipt
          ? [matching.find((match) => Boolean(match.receipt))!.receipt as EvidenceReceipt]
          : [];
    for (const receipt of chosen) selectedEvidenceReceiptIds.push(receipt.recordId);
  }

  const uniqueSelectedEvidenceIds = [...new Set(selectedEvidenceReceiptIds)];
  const reviewReceipts = validRecords.filter((record): record is ReviewReceipt => record.recordType === 'review-receipt');
  const reviewReceipt = latest(
    reviewReceipts.filter(
      (record) =>
        record.outcome === 'passed' &&
        uniqueSelectedEvidenceIds.every((id) => record.evidenceReceiptIds.includes(id)),
    ),
    (record) => record.issuedAt,
  );

  const grants = validRecords.filter((record): record is CapabilityGrant => record.recordType === 'capability-grant');
  const grant = latest(
    grants.filter(
      (record) =>
        !isExpired(record.expiresAt, now) &&
        (!policy.review.required || record.reviewReceiptId === reviewReceipt?.recordId) &&
        uniqueSelectedEvidenceIds.every((id) => record.evidenceReceiptIds.includes(id)),
    ),
    (record) => record.issuedAt,
  );

  const revocations = validRecords.filter((record): record is RevocationReceipt => record.recordType === 'revocation-receipt');
  const revoked = Boolean(
    grant &&
      revocations.some(
        (record) => parseTimestamp(record.effectiveAt) >= parseTimestamp(grant.issuedAt) && parseTimestamp(record.effectiveAt) <= now,
      ),
  );

  const suspensions = validRecords.filter((record): record is SuspensionReceipt => record.recordType === 'suspension-receipt');
  const latestSuspension = grant
    ? latest(
        suspensions.filter((record) => parseTimestamp(record.effectiveAt) >= parseTimestamp(grant.issuedAt) && parseTimestamp(record.effectiveAt) <= now),
        (record) => record.effectiveAt,
      )
    : null;
  const suspended = latestSuspension?.status === 'suspended';

  const executionReceipts = validRecords.filter((record): record is ExecutionReceipt => record.recordType === 'execution-receipt');
  const executionReceipt = latest(executionReceipts, (record) => record.issuedAt);

  const base = evaluateCapability(policy, {
    evidence,
    reviewPassed: !policy.review.required || Boolean(reviewReceipt),
    explicitGrant: !policy.grant.required || (Boolean(grant) && !revoked),
    actionRegistered: Boolean(executionReceipt?.actionRegistered),
    destinationAccepted: Boolean(executionReceipt?.destinationAccepted),
    suspended,
    expiresAt: grant?.expiresAt ?? null,
    evaluatedAt: new Date(now),
  });

  const blockers = [...base.blockers];
  if (revoked) blockers.push('Capability grant has been revoked.');
  for (const diagnostic of diagnostics.filter((item) => !item.valid)) {
    blockers.push(`Invalid ${diagnostic.recordType} ${diagnostic.recordId}: ${diagnostic.reasons.join(', ')}`);
  }

  return {
    ...base,
    state: revoked && base.eligible && base.reviewed ? 'REVIEWED' : base.state,
    granted: revoked ? false : base.granted,
    active: revoked ? false : base.active,
    blockers,
    explanation: revoked
      ? 'The previously issued bounded grant has been revoked; eligibility and review evidence do not recreate authority.'
      : base.explanation,
    subject: bundle.subject,
    policyDigest: digestCapabilityPolicy(policy),
    validRecordIds: [...validIds],
    selectedEvidenceReceiptIds: uniqueSelectedEvidenceIds,
    reviewReceiptId: reviewReceipt?.recordId ?? null,
    grantReceiptId: grant?.recordId ?? null,
    executionReceiptId: executionReceipt?.recordId ?? null,
    revoked,
    recordDiagnostics: diagnostics,
  };
}
