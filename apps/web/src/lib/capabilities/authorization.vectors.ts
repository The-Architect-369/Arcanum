import {
  digestAuthorizationRecord,
  digestCapabilityPolicy,
  evaluateCapabilityAuthorization,
  type AuthorizationRecord,
  type CapabilityAuthorizationBundle,
  type RecordVerifier,
} from './authorization';
import type { CapabilityState } from './evaluator';
import { getCapabilityPolicy } from './policies';

const SUBJECT = 'did:arcanum:test-subject';
const ISSUER = 'did:arcanum:test-issuer';
const NOW = '2026-08-24T22:55:00.000Z';
const verifier: RecordVerifier = (record) => record.signature.value === 'test-valid';

function seal<T extends AuthorizationRecord>(record: T): T {
  return { ...record, contentDigest: digestAuthorizationRecord(record) };
}

function baseRecord(policyId: string, recordId: string) {
  const policy = getCapabilityPolicy(policyId);
  return {
    schemaVersion: 'arcnet.authorization.v0.2' as const,
    recordId,
    issuer: ISSUER,
    subject: SUBJECT,
    capabilityId: policy.id,
    policyDigest: digestCapabilityPolicy(policy),
    issuedAt: '2026-08-24T22:50:00.000Z',
    contentDigest: '',
    signature: {
      algorithm: 'ed25519' as const,
      keyId: `${ISSUER}#test-key`,
      value: 'test-valid',
    },
  };
}

function activeAssuranceBundle(): CapabilityAuthorizationBundle {
  const policyId = 'protection.market-assurance.review';
  const evidence = [
    seal({
      ...baseRecord(policyId, 'ev-vitae'),
      recordType: 'evidence-receipt' as const,
      evidenceId: 'grade-v-scholar-recognition',
      evidenceKind: 'vitae' as const,
      scope: 'market-assurance eligibility',
      expiresAt: null,
    }),
    ...[
      'subject-matter-competence',
      'conflict-disclosure',
      'defined-evidence-grade',
      'assurance-scope',
    ].map((evidenceId, index) =>
      seal({
        ...baseRecord(policyId, `ev-domain-${index}`),
        recordType: 'evidence-receipt' as const,
        evidenceId,
        evidenceKind: 'domain' as const,
        scope: 'market-assurance eligibility',
        expiresAt: null,
      }),
    ),
    seal({
      ...baseRecord(policyId, 'ev-safety'),
      recordType: 'evidence-receipt' as const,
      evidenceId: 'typed-claim-boundary',
      evidenceKind: 'safety' as const,
      scope: 'market-assurance eligibility',
      expiresAt: null,
    }),
  ];
  const evidenceIds = evidence.map((record) => record.recordId);
  const review = seal({
    ...baseRecord(policyId, 'review-1'),
    recordType: 'review-receipt' as const,
    outcome: 'passed' as const,
    evidenceReceiptIds: evidenceIds,
    reviewScope: 'market-assurance reviewer eligibility',
  });
  const grant = seal({
    ...baseRecord(policyId, 'grant-1'),
    recordType: 'capability-grant' as const,
    authorityBasis: 'explicit Protection reviewer delegation',
    scope: 'typed market-assurance review',
    reviewReceiptId: review.recordId,
    evidenceReceiptIds: evidenceIds,
    expiresAt: '2026-09-24T00:00:00.000Z',
  });
  const execution = seal({
    ...baseRecord(policyId, 'exec-1'),
    recordType: 'execution-receipt' as const,
    actionId: 'market-assurance.review:v1',
    destination: 'protection',
    actionRegistered: true,
    destinationAccepted: true,
  });
  return { subject: SUBJECT, records: [...evidence, review, grant, execution] };
}

export type AuthorizationVectorResult = {
  name: string;
  expected: CapabilityState;
  actual: CapabilityState;
  pass: boolean;
};

export function runAuthorizationTestVectors(): AuthorizationVectorResult[] {
  const policy = getCapabilityPolicy('protection.market-assurance.review');
  const active = activeAssuranceBundle();
  const badSignature = {
    ...active,
    records: active.records.map((record) =>
      record.recordType === 'capability-grant'
        ? { ...record, signature: { ...record.signature, value: 'invalid' } }
        : record,
    ),
  };
  const wrongSubject = {
    ...active,
    records: active.records.map((record) =>
      record.recordType === 'capability-grant' ? { ...record, subject: 'did:arcanum:other' } : record,
    ),
  };
  const tamperedPolicy = {
    ...active,
    records: active.records.map((record) =>
      record.recordType === 'capability-grant' ? { ...record, policyDigest: 'sha256:tampered' } : record,
    ),
  };
  const revoked = {
    ...active,
    records: [
      ...active.records,
      seal({
        ...baseRecord(policy.id, 'revoke-1'),
        recordType: 'revocation-receipt' as const,
        effectiveAt: '2026-08-24T22:54:00.000Z',
        reason: 'test revocation',
      }),
    ],
  };

  const vectors: Array<{ name: string; bundle: CapabilityAuthorizationBundle; expected: CapabilityState }> = [
    { name: 'fully bound typed receipts activate capability', bundle: active, expected: 'ACTIVE' },
    { name: 'invalid grant signature fails closed', bundle: badSignature, expected: 'REVIEWED' },
    { name: 'subject mismatch cannot transfer grant', bundle: wrongSubject, expected: 'REVIEWED' },
    { name: 'policy digest mismatch invalidates stale grant', bundle: tamperedPolicy, expected: 'REVIEWED' },
    { name: 'revocation removes authority without deleting eligibility', bundle: revoked, expected: 'REVIEWED' },
  ];

  return vectors.map((vector) => {
    const actual = evaluateCapabilityAuthorization(policy, vector.bundle, verifier, NOW).state;
    return { name: vector.name, expected: vector.expected, actual, pass: actual === vector.expected };
  });
}
