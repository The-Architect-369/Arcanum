"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import CurrentTopicVisual from "./CurrentTopicVisual";
import CurrentPanel from "./CurrentPanel";
export type CurrentEntry = {
  id: string;
  title: string;
  summary: string;
  status: string;
  action: string;
  logo?: boolean;
  topic?: string;
  content: React.ReactNode;
};
export default function CurrentCards({
  entries,
  label,
}: {
  entries: CurrentEntry[];
  label: string;
}) {
  const [selected, setSelected] = useState<CurrentEntry | null>(null);
  return (
    <>
      <div className="updates-list current-cards">
        {entries.map((entry) => (
          <button
            type="button"
            className="current-card"
            key={entry.id}
            onClick={(event) => {
              event.currentTarget.focus({ preventScroll: true });
              setSelected(entry);
            }}
          >
            {entry.logo && (
              <img src="/logo-arcanum.svg" width="72" height="72" alt="" />
            )}
            {entry.topic && <CurrentTopicVisual topic={entry.topic} />}
            <span className="current-card-heading">
              {entry.title}
              <ChevronRight size={20} aria-hidden="true" />
            </span>
            <span className="updates-card-meaning">{entry.summary}</span>
            <span className="updates-status-pill">{entry.status}</span>
            <span className="updates-card-action">{entry.action}</span>
          </button>
        ))}
      </div>
      {selected && (
        <CurrentPanel
          title={selected.title}
          label={label}
          onClose={() => setSelected(null)}
        >
          {selected.content}
        </CurrentPanel>
      )}
    </>
  );
}
