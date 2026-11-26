"use client";
import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import CurrentTopicVisual, { type RoadmapTopic } from "./CurrentTopicVisual";

type Domain = {
  id: string;
  title: string;
  summary: string;
  status: string;
  topic: RoadmapTopic;
  content: ReactNode;
};
export default function CurrentCards({
  entries,
  label,
}: {
  entries: Domain[];
  label: string;
}) {
  const [selected, select] = useState<Domain | null>(null);
  const tiles = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const reading = useRef<HTMLDivElement>(null);
  function back() {
    const id = selected?.id;
    select(null);
    requestAnimationFrame(() =>
      tiles.current
        ?.querySelector<HTMLButtonElement>(`[data-domain="${id}"]`)
        ?.focus(),
    );
  }
  if (!selected)
    return (
      <div
        className="roadmap-tiles"
        role="group"
        aria-label={label}
        ref={tiles}
      >
        {entries.map((entry) => (
          <button
            type="button"
            key={entry.id}
            data-domain={entry.id}
            className="roadmap-tile"
            onClick={() => {
              select(entry);
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            <CurrentTopicVisual topic={entry.topic} />
            <span>{entry.title}</span>
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        ))}
      </div>
    );
  return (
    <div className="roadmap-expanded">
      <div className="roadmap-controls">
        <button type="button" className="roadmap-back" onClick={back}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to domains
        </button>
        <div role="group" aria-label="Switch domain" className="roadmap-switch">
          {entries.map((entry) => (
            <button
              type="button"
              key={entry.id}
              aria-label={entry.title}
              aria-pressed={selected.id === entry.id}
              onClick={() => {
                select(entry);
                reading.current?.scrollTo({ top: 0, behavior: "instant" });
              }}
            >
              <CurrentTopicVisual topic={entry.topic} />
            </button>
          ))}
        </div>
        <h2 id="roadmap-selected" ref={heading} tabIndex={-1}>
          {selected.title}
        </h2>
        <p>{selected.status}</p>
      </div>
      <div
        className="roadmap-reading"
        role="region"
        aria-labelledby="roadmap-selected"
        ref={reading}
        tabIndex={0}
      >
        <p>{selected.summary}</p>
        {selected.content}
        <p className="updates-footnote">Directions are not release promises.</p>
      </div>
    </div>
  );
}
