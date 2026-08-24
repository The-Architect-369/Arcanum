import type { CapabilityPolicy, EvidenceGroup } from './evaluator';

function group(
  id: string,
  label: string,
  kind: EvidenceGroup['kind'],
  operator: EvidenceGroup['operator'],
  items: Array<[string, string]>,
): EvidenceGroup {
  return {
    id,
    label,
    kind,
    operator,
    items: items.map(([itemId, itemLabel]) => ({ id: itemId, label: itemLabel })),
  };
}

export const CAPABILITY_POLICIES = [
  {
    id: 'commercium.listing.publish',
    system: 'commercium',
    label: 'Publish ordinary Commercium listing',
    verb: 'publish-listing',
    riskLane: 'ordinary-participation',
    humanIntent: 'Offer an ordinary lawful object or service to a chosen audience.',
    evidenceGroups: [
      group('listing-domain', 'Listing disclosure and economic terms', 'domain', 'all', [
        ['listing-disclosure-rules', 'Listing disclosure rules are satisfied.'],
        ['claim-evidence-typing', 'Factual claims use the required claim/evidence typing.'],
        ['visible-economic-terms', 'Economic terms are visible before authorization.'],
      ]),
      group('listing-safety', 'Ordinary marketplace safety boundary', 'safety', 'all', [
        ['ordinary-lawful-scope', 'The listing is inside the ordinary lawful marketplace scope.'],
      ]),
    ],
    review: {
      required: false,
      label: 'Ordinary marketplace review is not required for this evaluator profile.',
    },
    grant: {
      required: false,
      label: 'Participant market participation supplies the ordinary bounded authority source.',
    },
    execution: {
      requiresRegisteredAction: true,
      requiresDestinationAcceptance: true,
    },
    junctionContext: ['standards-and-rights', 'practice-safety'],
    edgeContractRequired: false,
    authorityNote: 'Ordinary buying and selling may not be gated by Vitae advancement.',
  },
  {
    id: 'commercium.vitae-provenance.attach',
    system: 'commercium',
    label: 'Attach selected Vitae provenance',
    verb: 'attach-selected-vitae-provenance',
    riskLane: 'contributory',
    humanIntent: 'Attach a participant-selected bounded Vitae projection to a craft or service record.',
    evidenceGroups: [
      group('selected-vitae-receipts', 'Selected Vitae receipts exist', 'vitae', 'all', [
        ['selected-vitae-receipts-exist', 'Only selected existing recognition or achievement receipts are referenced.'],
      ]),
      group('provenance-domain', 'Purpose-bound provenance disclosure', 'domain', 'all', [
        ['projection-purpose', 'The projection purpose is explicit.'],
        ['projection-audience-retention', 'Audience and retention are disclosed.'],
        ['projection-provenance-integrity', 'Provenance integrity is preserved.'],
        ['no-whole-vitae-history', 'The whole Vitae history is not exported.'],
      ]),
      group('provenance-safety', 'Participant disclosure consent', 'safety', 'all', [
        ['participant-disclosure-consent', 'The participant explicitly authorized this bounded disclosure.'],
      ]),
    ],
    review: {
      required: true,
      label: 'Destination schema validation has not passed.',
    },
    grant: {
      required: true,
      label: 'The bounded participant disclosure grant is missing.',
    },
    execution: {
      requiresRegisteredAction: true,
      requiresDestinationAcceptance: true,
    },
    junctionContext: ['market-assurance'],
    edgeContractRequired: true,
    authorityNote: 'The projection may show provenance. It may not create rank, pricing privilege, or verifier authority.',
  },
  {
    id: 'protection.market-assurance.review',
    system: 'protection',
    label: 'Perform market-assurance review',
    verb: 'perform-market-assurance-review',
    riskLane: 'stewardship',
    humanIntent: 'Review one typed market or provenance claim and state exactly what evidence was verified.',
    evidenceGroups: [
      group('assurance-vitae', 'Relevant recognized Vitae evidence', 'vitae', 'any', [
        ['grade-v-scholar-recognition', 'Grade V Scholar recognition supports evidence/knowledge review eligibility.'],
        ['grade-vi-healer-recognition', 'Grade VI Healer recognition supports safety/repair review eligibility.'],
      ]),
      group('assurance-domain', 'Claim-specific reviewer competence', 'domain', 'all', [
        ['subject-matter-competence', 'Claim-specific subject-matter competence is evidenced.'],
        ['conflict-disclosure', 'Required independence/conflict disclosure is complete.'],
        ['defined-evidence-grade', 'The claim uses a defined evidence grade.'],
        ['assurance-scope', 'The assurance scope is explicit.'],
      ]),
      group('assurance-safety', 'Assurance safety prerequisites', 'safety', 'all', [
        ['typed-claim-boundary', 'The result is limited to the typed claim actually reviewed.'],
      ]),
    ],
    review: {
      required: true,
      label: 'Protection/domain reviewer eligibility review has not passed.',
    },
    grant: {
      required: true,
      label: 'Explicit Protection/domain reviewer delegation is missing.',
    },
    execution: {
      requiresRegisteredAction: true,
      requiresDestinationAcceptance: true,
    },
    junctionContext: ['market-assurance', 'practice-safety'],
    edgeContractRequired: true,
    authorityNote: 'Wizard, Magus, Architect, Grade, or geometry alone cannot create reviewer authority.',
  },
  {
    id: 'protection.interlock.apply-preauthorized',
    system: 'protection',
    label: 'Apply preauthorized Protection interlock',
    verb: 'apply-preauthorized-interlock',
    riskLane: 'high-consequence',
    humanIntent: 'Apply a narrowly preauthorized safety control under an already-authorized policy.',
    evidenceGroups: [
      group('interlock-domain', 'Preauthorized interlock contract', 'domain', 'all', [
        ['policy-version', 'A preexisting policy version authorizes the interlock.'],
        ['typed-trigger', 'The trigger is typed and evidenced.'],
        ['bounded-scope', 'The interlock scope is bounded.'],
        ['auditability', 'The action is auditable.'],
      ]),
      group('interlock-safety', 'Exceptional-authority safeguards', 'safety', 'all', [
        ['sunset-when-temporary', 'Temporary authority carries an expiry or sunset.'],
      ]),
    ],
    review: {
      required: false,
      label: 'The preauthorized policy supplies the immediate review path; later appeal may still apply.',
    },
    grant: {
      required: false,
      label: 'The already-authorized policy supplies the bounded authority source.',
    },
    execution: {
      requiresRegisteredAction: true,
      requiresDestinationAcceptance: false,
    },
    junctionContext: ['practice-safety'],
    edgeContractRequired: false,
    authorityNote: 'Deterministic policy enforcement must never depend on personal Vitae status.',
  },
  {
    id: 'imperium.vote.binding',
    system: 'imperium',
    label: 'Cast binding governance vote',
    verb: 'cast-binding-governance-vote',
    riskLane: 'high-consequence',
    humanIntent: 'Cast a binding vote where governance is activated and the proposal is inside delegated authority.',
    evidenceGroups: [
      group('vote-vitae', 'Governance responsibility eligibility', 'vitae', 'all', [
        ['v4-governance-steward-recognition', 'Active V4 Governance Steward eligibility is evidenced.'],
      ]),
      group('vote-domain', 'Governance participation prerequisites', 'domain', 'all', [
        ['identity-continuity-check', 'Identity continuity check is satisfied.'],
        ['active-governance-eligibility', 'Governance eligibility is active for this proposal scope.'],
        ['proposal-inside-authority', 'The proposal is inside the authority delegated to the process.'],
      ]),
      group('vote-safety', 'Constitutional voting safeguards', 'safety', 'all', [
        ['constitutional-invariants-preserved', 'The vote cannot override constitutional invariants.'],
      ]),
    ],
    review: {
      required: true,
      label: 'Identity, participation, and governance checks have not passed.',
    },
    grant: {
      required: true,
      label: 'The scoped binding-vote authority grant is missing.',
    },
    execution: {
      requiresRegisteredAction: true,
      requiresDestinationAcceptance: true,
    },
    junctionContext: ['standards-and-rights', 'practice-safety', 'cultural-commons'],
    edgeContractRequired: true,
    authorityNote: 'Vitae may contribute to eligibility. It does not create a vote or constitutional authority.',
  },
  {
    id: 'architect.release-candidate.prepare',
    system: 'architect',
    label: 'Prepare release candidate',
    verb: 'prepare-release-candidate',
    riskLane: 'high-consequence',
    humanIntent: 'Prepare a bounded release candidate for later independent verification and approval.',
    evidenceGroups: [
      group('release-vitae', 'High-responsibility release eligibility', 'vitae', 'any', [
        ['v6-protocol-steward-recognition', 'V6 Protocol Steward recognition is active.'],
        ['v7-architect-delegate-recognition', 'V7 Architect Delegate recognition is active.'],
      ]),
      group('release-domain', 'Release preparation evidence', 'domain', 'all', [
        ['typecheck-evidence', 'Typecheck evidence is present.'],
        ['build-evidence', 'Build evidence is present.'],
        ['chain-test-evidence', 'Relevant chain tests are present or explicitly non-applicable.'],
        ['verify-sync-evidence', 'Repository sync verification evidence is present.'],
        ['doctrine-review-evidence', 'Doctrine/layer-boundary review is present.'],
      ]),
      group('release-safety', 'Release separation safeguards', 'safety', 'all', [
        ['independent-verification-path', 'An independent Protection/reviewer path exists.'],
        ['no-deploy-by-preparation', 'Preparing the candidate does not itself deploy or ratify it.'],
      ]),
    ],
    review: {
      required: true,
      label: 'Release-preparation scope review has not passed.',
    },
    grant: {
      required: true,
      label: 'Explicit repository/release preparation delegation is missing.',
    },
    execution: {
      requiresRegisteredAction: true,
      requiresDestinationAcceptance: true,
    },
    junctionContext: ['standards-and-rights', 'creator-public-goods', 'market-assurance'],
    edgeContractRequired: true,
    authorityNote: 'Architect authorship and release preparation are distinct from Protection verification and deployment approval.',
  },
] as const satisfies readonly CapabilityPolicy[];

export type CapabilityPolicyId = (typeof CAPABILITY_POLICIES)[number]['id'];

export function getCapabilityPolicy(id: string): CapabilityPolicy {
  return CAPABILITY_POLICIES.find((policy) => policy.id === id) ?? CAPABILITY_POLICIES[0];
}
