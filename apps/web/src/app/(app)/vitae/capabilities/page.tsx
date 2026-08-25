import { VerifiableCapabilityEvaluatorDemo } from './VerifiableCapabilityEvaluatorDemo';

export const metadata = {
  title: 'Vitae → ARCnet Verifiable Capability Evaluator',
  description:
    'Design-candidate evaluator for signed evidence, review, bounded grants, lifecycle controls, and destination-owned ARCnet execution.',
};

export default function VitaeCapabilityEvaluatorPage() {
  return <VerifiableCapabilityEvaluatorDemo />;
}
