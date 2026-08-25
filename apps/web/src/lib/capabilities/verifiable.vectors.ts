import { getCapabilityPolicy } from './policies';
import { createVerifiableCapabilityDemoHarness } from './verifiable.demo';
import {
  evaluateVerifiableCapability,
  type CapabilityTrustAnchor,
  type SignedCapabilityRecord,
  type VerifiableCapabilityState,
} from './verifiable';

export type VerifiableCapabilityVectorResult = {
  name: string;
  expected: VerifiableCapabilityState;
  actual: VerifiableCapabilityState;
  pass: boolean;
};

async function evaluate(
  policyId: string,
  records: SignedCapabilityRecord[],
  trustAnchors: CapabilityTrustAnchor[],
  subjectId: string,
  actionRequestId: string,
): Promise<VerifiableCapabilityState> {
  const policy = getCapabilityPolicy(policyId);
  return (
    await evaluateVerifiableCapability(policy, {
      subjectId,
      actionRequestId,
      trustAnchors,
      records,
    })
  ).state;
}

export async function runVerifiableCapabilityTestVectors(): Promise<
  VerifiableCapabilityVectorResult[]
> {
  const policy = getCapabilityPolicy('protection.market-assurance.review');
  const harness = await createVerifiableCapabilityDemoHarness(policy);

  const vectors: Array<{
    name: string;
    records: SignedCapabilityRecord[];
    trustAnchors: CapabilityTrustAnchor[];
    expected: VerifiableCapabilityState;
  }> = [
    {
      name: 'no records is ineligible',
      records: harness.recordsByMode.empty,
      trustAnchors: harness.trustAnchors,
      expected: 'INELIGIBLE',
    },
    {
      name: 'valid signed evidence becomes eligible',
      records: harness.recordsByMode.eligible,
      trustAnchors: harness.trustAnchors,
      expected: 'ELIGIBLE',
    },
    {
      name: 'review is bound to the selected evidence digests',
      records: harness.recordsByMode.reviewed,
      trustAnchors: harness.trustAnchors,
      expected: 'REVIEWED',
    },
    {
      name: 'grant is bound to policy, subject, evidence set, and review',
      records: harness.recordsByMode.granted,
      trustAnchors: harness.trustAnchors,
      expected: 'GRANTED',
    },
    {
      name: 'destination registration and acceptance activate the verb',
      records: harness.recordsByMode.active,
      trustAnchors: harness.trustAnchors,
      expected: 'ACTIVE',
    },
    {
      name: 'signed suspension overrides an otherwise active grant',
      records: harness.recordsByMode.suspended,
      trustAnchors: harness.trustAnchors,
      expected: 'SUSPENDED',
    },
    {
      name: 'signed revocation terminates an otherwise active grant',
      records: harness.recordsByMode.revoked,
      trustAnchors: harness.trustAnchors,
      expected: 'REVOKED',
    },
    {
      name: 'expired signed grant cannot remain active',
      records: harness.recordsByMode.expired,
      trustAnchors: harness.trustAnchors,
      expected: 'EXPIRED',
    },
    {
      name: 'payload tampering invalidates evidence signatures',
      records: harness.recordsByMode.tampered,
      trustAnchors: harness.trustAnchors,
      expected: 'INELIGIBLE',
    },
    {
      name: 'removing the evidence trust anchor invalidates otherwise signed evidence',
      records: harness.recordsByMode.eligible,
      trustAnchors: harness.trustAnchors.filter(
        (anchor) => !anchor.roles.includes('evidence-issuer'),
      ),
      expected: 'INELIGIBLE',
    },
    {
      name: 'removing destination trust prevents execution activation',
      records: harness.recordsByMode.active,
      trustAnchors: harness.trustAnchors.filter(
        (anchor) => !anchor.roles.includes('destination'),
      ),
      expected: 'GRANTED',
    },
  ];

  const results: VerifiableCapabilityVectorResult[] = [];
  for (const vector of vectors) {
    const actual = await evaluate(
      policy.id,
      vector.records,
      vector.trustAnchors,
      harness.subjectId,
      harness.actionRequestId,
    );
    results.push({
      name: vector.name,
      expected: vector.expected,
      actual,
      pass: actual === vector.expected,
    });
  }
  return results;
}
