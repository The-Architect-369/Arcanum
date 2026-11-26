"use client";
import { useState } from "react";
import { Network, PanelsTopLeft, Smartphone } from "lucide-react";
import CurrentPanel from "./CurrentPanel";
import type { UpdatePost } from "@/lib/update-posts";
const domainVisuals = {
  arcanum: { label: "Application", Icon: Smartphone },
  website: { label: "Web experience", Icon: PanelsTopLeft },
  arcnet: { label: "ARCnet", Icon: Network },
} as const;
const subjectLabels = {
  hope: "Hope gem",
  vitae: "Vitae icosahedron",
  tempus: "Tempus dodecahedron",
  arcnet: "ARCnet star tetrahedron",
} as const;
function PostCardBody({ post }: { post: UpdatePost }) {
  const { label, Icon } =
    domainVisuals[
      post.topic ?? (post.category === "website" ? "website" : "arcanum")
    ];
  return (
    <>
      <div className="post-card-meta">
        <time dateTime={post.date}>{post.date}</time>
        {post.subject ? (
          <img
            className="post-subject"
            src={`/current-icons/${post.subject}-subject.svg`}
            alt={subjectLabels[post.subject]}
            width="40"
            height="40"
          />
        ) : (
          <Icon size={24} aria-hidden="true" />
        )}
      </div>
      <h3>{post.title}</h3>
      <p className="updates-card-meaning">{post.summary ?? post.detail}</p>
      <div className="post-card-footer">
        <span className="updates-status-pill">{label}</span>
        <span className="updates-card-action">Open update →</span>
      </div>
    </>
  );
}
export default function UpdateRows({ posts }: { posts: UpdatePost[] }) {
  const [selected, setSelected] = useState<UpdatePost | null>(null);
  return (
    <>
      <div className="updates-list">
        {posts.map((post) => (
          <a
            className="updates-row"
            href={`/updates/${post.id}`}
            key={post.id}
            onClick={(event) => {
              if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                event.shiftKey
              )
                return;
              event.preventDefault();
              event.currentTarget.focus({ preventScroll: true });
              setSelected(post);
            }}
          >
            <PostCardBody post={post} />
          </a>
        ))}
      </div>
      {selected && (
        <CurrentPanel
          title={selected.title}
          label={
            selected.category === "website"
              ? "Website journal"
              : "Development update"
          }
          onClose={() => setSelected(null)}
        >
          <p className="updates-meta">
            <time dateTime={selected.date}>{selected.date}</time> ·{" "}
            {selected.status}
          </p>
          {selected.summary && (
            <p className="updates-panel-lead">{selected.summary}</p>
          )}
          <details className="updates-technical-record">
            <summary>Details and source</summary>
            <p>{selected.detail}</p>
            {selected.source && (
              <a href={selected.source}>Inspect the source record ↗</a>
            )}
          </details>
          <div className="updates-post-panel-links">
            <a href={`/updates/${selected.id}`}>Open the full page →</a>
          </div>
          <p className="updates-footnote">
            A dated record. Integration, public availability and Human
            acceptance are separate states.
          </p>
        </CurrentPanel>
      )}
    </>
  );
}
