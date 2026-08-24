import {
  createEmptyCapabilityFacts,
  evaluateCapability,
  satisfyEligibilityEvidence,
  type CapabilityFacts,
  type CapabilityState,
} from './evaluator';
import { getCapabilityPolicy } from './policies';

export type CapabilityEvaluatorVectorResult = {
  name: string;
  expected: CapabilityState;
  actual: CapabilityState;
  pass: boolean;
};

function activeFacts(capabilityId: string): CapabilityFacts {
  const policy = getCapabilityPolicy(capabilityId);
  const eligible = satisfyEligibilityEvidence(policy, createEmptyCapabilityFacts(policy));
  return {
    ...eligible,
    reviewPassed: true,
    explicitGrant: true,
    actionRegistered: true,
    destinationAccepted: true,
  };
}

export function runCapabilityEvaluatorTestVectors(): CapabilityEvaluatorVectorResult[] {
  const assurancePolicy = getCapabilityPolicy('protection.market-assurance.review');
  const assuranceEmpty = createEmptyCapabilityFacts(assurancePolicy);
  const assuranceEligible = satisfyEligibilityEvidence(assurancePolicy, assuranceEmpty);

  const vectors: Array<{
    name: string;
    capabilityId: string;
    facts: CapabilityFacts;
    expected: CapabilityState;
  }> = [
    {
      name: 'missing evidence remains ineligible even with a grant',
      capabilityId: assurancePolicy.id,
      facts: {
        ...assuranceEmpty,
        explicitGrant: true,
        actionRegistered: true,
        destinationAccepted: true,
      },
      expected: 'INELIGIBLE',
    },
    {
      name: 'eligible evidence waits for review',
      capabilityId: assurancePolicy.id,
      facts: assuranceEligible,
      expected: 'ELIGIBLE',
    },
    {
      name: 'reviewed evidence waits for explicit grant',
      capabilityId: assurancePolicy.id,
      facts: { ...assuranceEligible, reviewPassed: true },
      expected: 'REVIEWED',
    },
    {
      name: 'grant waits for registered execution path',
      capabilityId: assurancePolicy.id,
      facts: { ...assuranceEligible, reviewPassed: true, explicitGrant: true },
      expected: 'GRANTED',
    },
    {
      name: 'active capability requires all execution predicates',
      capabilityId: assurancePolicy.id,
      facts: activeFacts(assurancePolicy.id),
      expected: 'ACTIVE',
    },
    {
      name: 'forbidden title and geometry signals do not activate capability',
      capabilityId: assurancePolicy.id,
      facts: {
        ...assuranceEmpty,
        forbiddenSignals: {
          achievementTitle: true,
          geometryAlignment: true,
          gradeIndex: true,
          currentVitaePosition: true,
        },
      },
      expected: 'INELIGIBLE',
    },
    {
      name: 'suspension overrides otherwise active capability',
      capabilityId: assurancePolicy.id,
      facts: { ...activeFacts(assurancePolicy.id), suspended: true },
      expected: 'SUSPENDED',
    },
    {
      name: 'expiration overrides suspension when both apply',
      capabilityId: assurancePolicy.id,
      facts: {
        ...activeFacts(assurancePolicy.id),
        suspended: true,
        expiresAt: '2026-01-01T00:00:00.000Z',
        evaluatedAt: '2026-08-24T22:33:00.000Z',
      },
      expected: 'EXPIRED',
    },
    {
      name: 'ordinary listing has no Vitae requirement',
      capabilityId: 'commercium.listing.publish',
      facts: {
        ...satisfyEligibilityEvidence(
          getCapabilityPolicy('commercium.listing.publish'),
          createEmptyCapabilityFacts(getCapabilityPolicy('commercium.listing.publish')),
        ),
        actionRegistered: true,
        destinationAccepted: true,
      },
      expected: 'ACTIVE',
    },
    {
      name: 'preauthorized interlock does not use Vitae status',
      capabilityId: 'protection.interlock.apply-preauthorized',
      facts: {
        ...satisfyEligibilityEvidence(
          getCapabilityPolicy('protection.interlock.apply-preauthorized'),
          createEmptyCapabilityFacts(getCapabilityPolicy('protection.interlock.apply-preauthorized')),
        ),
        actionRegistered: true,
        forbiddenSignals: {
          achievementTitle: true,
          gradeIndex: true,
        },
      },
      expected: 'ACTIVE',
    },
  ];

  return vectors.map((vector) => {
    const actual = evaluateCapability(getCapabilityPolicy(vector.capabilityId), vector.facts).state;
    return {
      name: vector.name,
      expected: vector.expected,
      actual,
      pass: actual === vector.expected,
    };
  });
}
