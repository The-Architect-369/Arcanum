import { Network, PanelsTopLeft, Smartphone } from "lucide-react";
export default function CurrentTopicVisual({ topic }: { topic?: string }) {
  const network = topic === "arcnet";
  const website = topic === "website";
  const Icon = network ? Network : website ? PanelsTopLeft : Smartphone;
  const label = network
    ? "Network"
    : website
      ? "Web experience"
      : "Application";
  return (
    <span
      className={`current-topic-visual current-topic-${topic ?? "arcanum"}`}
      role="img"
      aria-label={`${label} topic icon, not a product screenshot`}
    >
      <Icon size={32} aria-hidden="true" />
      <span aria-hidden="true">{label}</span>
    </span>
  );
}
