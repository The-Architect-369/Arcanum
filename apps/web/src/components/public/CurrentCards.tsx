"use client";
import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import CurrentTopicVisual, { type RoadmapTopic } from "./CurrentTopicVisual";

type Domain = {
  id: string;
  title: string;
  summary: string;
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
              tiles.current
                ?.closest(".roadmap")
                ?.scrollTo({ top: 0, behavior: "instant" });
              select(entry);
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            <CurrentTopicVisual topic={entry.topic} />
            <span className="roadmap-tile-copy">
              <strong>{entry.title}</strong>
              <span>{entry.summary}</span>
            </span>
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        ))}
      </div>
    );
  return (
    <div className="roadmap-expanded">
      <div className="roadmap-controls">
        <button
          type="button"
          className="roadmap-back"
          aria-label="Back to domains"
          onClick={back}
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <h2 id="roadmap-selected" ref={heading} tabIndex={-1}>
          {selected.title}
        </h2>
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
      </div>
      <div
        className="roadmap-reading"
        role="region"
        aria-labelledby="roadmap-selected"
        ref={reading}
        tabIndex={0}
      >
        {selected.content}
      </div>
    </div>
  );
}
