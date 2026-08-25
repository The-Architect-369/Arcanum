import type { CapabilityPolicy } from './evaluator';
import {
  evaluateVerifiableCapability,
  type VerifiableCapabilityEvaluation,
  type VerifiableCapabilityInput,
  type VerifiableCapabilityState,
} from './verifiable';

export const AUTHORIZATION_DECISIONS = ['ALLOW', 'DENY'] as const;
export type AuthorizationDecision = (typeof AUTHORIZATION_DECISIONS)[number];

export type AuthorizationReasonCode =
  | 'ACTIVE_VERIFIED'
  | 'ELIGIBILITY_UNSATISFIED'
  | 'REVIEW_REQUIRED'
  | 'GRANT_REQUIRED'
  | 'GRANT_SUSPENDED'
  | 'GRANT_REVOKED'
  | 'GRANT_EXPIRED'
  | 'EXECUTION_PATH_INCOMPLETE'
  | 'VERIFICATION_ERROR';

export type CapabilityAuthorizationDecision = {
  capabilityId: string;
  subjectId: string;
  actionRequestId: string;
  decision: AuthorizationDecision;
  reasonCode: AuthorizationReasonCode;
  state: VerifiableCapabilityState | null;
  policyDigest: string | null;
  selectedEvidenceDigests: string[];
  selectedReviewDigest: string | null;
  selectedGrantDigest: string | null;
  selectedActionRegistrationDigest: string | null;
  selectedDestinationDecisionDigest: string | null;
  blockers: string[];
  evaluation: VerifiableCapabilityEvaluation | null;
};

function reasonForState(state: VerifiableCapabilityState): AuthorizationReasonCode {
  switch (state) {
    case 'ACTIVE':
      return 'ACTIVE_VERIFIED';
    case 'INELIGIBLE':
      return 'ELIGIBILITY_UNSATISFIED';
    case 'ELIGIBLE':
      return 'REVIEW_REQUIRED';
    case 'REVIEWED':
      return 'GRANT_REQUIRED';
    case 'SUSPENDED':
      return 'GRANT_SUSPENDED';
    case 'REVOKED':
      return 'GRANT_REVOKED';
    case 'EXPIRED':
      return 'GRANT_EXPIRED';
    case 'GRANTED':
      return 'EXECUTION_PATH_INCOMPLETE';
  }
}

export async function authorizeCapabilityAction(
  policy: CapabilityPolicy,
  input: VerifiableCapabilityInput,
): Promise<CapabilityAuthorizationDecision> {
  try {
    const evaluation = await evaluateVerifiableCapability(policy, input);
    const allowed = evaluation.state === 'ACTIVE';

    return {
      capabilityId: policy.id,
      subjectId: input.subjectId,
      actionRequestId: input.actionRequestId,
      decision: allowed ? 'ALLOW' : 'DENY',
      reasonCode: reasonForState(evaluation.state),
      state: evaluation.state,
      policyDigest: evaluation.policyDigest,
      selectedEvidenceDigests: [...evaluation.selectedEvidenceDigests],
      selectedReviewDigest: evaluation.selectedReviewDigest,
      selectedGrantDigest: evaluation.selectedGrantDigest,
      selectedActionRegistrationDigest: evaluation.selectedActionRegistrationDigest,
      selectedDestinationDecisionDigest: evaluation.selectedDestinationDecisionDigest,
      blockers: [...evaluation.blockers],
      evaluation,
    };
  } catch (error) {
    return {
      capabilityId: policy.id,
      subjectId: input.subjectId,
      actionRequestId: input.actionRequestId,
      decision: 'DENY',
      reasonCode: 'VERIFICATION_ERROR',
      state: null,
      policyDigest: null,
      selectedEvidenceDigests: [],
      selectedReviewDigest: null,
      selectedGrantDigest: null,
      selectedActionRegistrationDigest: null,
      selectedDestinationDecisionDigest: null,
      blockers: [
        error instanceof Error
          ? `Authorization verification failed: ${error.message}`
          : 'Authorization verification failed.',
      ],
      evaluation: null,
    };
  }
}
