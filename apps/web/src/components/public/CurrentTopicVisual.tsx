import { Network, PanelsTopLeft, Smartphone } from "lucide-react";

export type RoadmapTopic = "arcanum" | "arcnet" | "website";
const icons = { arcanum: Smartphone, arcnet: Network, website: PanelsTopLeft };
export default function CurrentTopicVisual({ topic }: { topic: RoadmapTopic }) {
  const Icon = icons[topic];
  return <Icon aria-hidden="true" size={25} strokeWidth={1.7} />;
}
