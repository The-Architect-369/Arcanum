import { authorizeCapabilityAction, type AuthorizationDecision } from './authorization-gate';
import { createVerifiableCapabilityDemoHarness, type VerifiableDemoMode } from './verifiable.demo';
import type { VerifiableCapabilityState } from './verifiable';
import { getCapabilityPolicy } from './policies';

export type AuthorizationGateVectorResult = {
  mode: VerifiableDemoMode;
  expectedDecision: AuthorizationDecision;
  actualDecision: AuthorizationDecision;
  expectedState: VerifiableCapabilityState;
  actualState: VerifiableCapabilityState | null;
  pass: boolean;
};

export async function runAuthorizationGateVectors(): Promise<AuthorizationGateVectorResult[]> {
  const policy = getCapabilityPolicy('protection.market-assurance.review');
  const harness = await createVerifiableCapabilityDemoHarness(policy);
  const expected: Array<{
    mode: VerifiableDemoMode;
    decision: AuthorizationDecision;
    state: VerifiableCapabilityState;
  }> = [
    { mode: 'empty', decision: 'DENY', state: 'INELIGIBLE' },
    { mode: 'eligible', decision: 'DENY', state: 'ELIGIBLE' },
    { mode: 'reviewed', decision: 'DENY', state: 'REVIEWED' },
    { mode: 'granted', decision: 'DENY', state: 'GRANTED' },
    { mode: 'active', decision: 'ALLOW', state: 'ACTIVE' },
    { mode: 'suspended', decision: 'DENY', state: 'SUSPENDED' },
    { mode: 'revoked', decision: 'DENY', state: 'REVOKED' },
    { mode: 'expired', decision: 'DENY', state: 'EXPIRED' },
    { mode: 'tampered', decision: 'DENY', state: 'INELIGIBLE' },
  ];

  return Promise.all(
    expected.map(async (vector) => {
      const result = await authorizeCapabilityAction(policy, {
        subjectId: harness.subjectId,
        actionRequestId: harness.actionRequestId,
        trustAnchors: harness.trustAnchors,
        records: harness.recordsByMode[vector.mode],
      });

      return {
        mode: vector.mode,
        expectedDecision: vector.decision,
        actualDecision: result.decision,
        expectedState: vector.state,
        actualState: result.state,
        pass: result.decision === vector.decision && result.state === vector.state,
      };
    }),
  );
}
