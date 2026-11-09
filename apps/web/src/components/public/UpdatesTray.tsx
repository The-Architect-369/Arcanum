import { Rss, Smartphone, Route } from "lucide-react";
const destinations = [
  { id: "updates", label: "Updates", icon: Rss },
  { id: "app", label: "App", icon: Smartphone },
  { id: "ahead", label: "Ahead", icon: Route },
] as const;
export default function UpdatesTray({
  active = "updates",
}: {
  active?: string;
}) {
  return (
    <nav className="updates-nav" aria-label="Follow Arcanum development">
      {destinations.map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={`/updates?view=${id}`}
          aria-current={id === active ? "page" : undefined}
        >
          <Icon size={22} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
