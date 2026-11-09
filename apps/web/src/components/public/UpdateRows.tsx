"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { UpdatePost } from "@/lib/update-posts";
export default function UpdateRows({ posts }: { posts: UpdatePost[] }) {
  const [selected, setSelected] = useState<UpdatePost | null>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLAnchorElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!selected) return;
    if (typeof panel.current?.showModal !== "function") {
      window.location.assign(`/updates/${selected.id}`);
      return;
    }
    panel.current.showModal();
    closeButton.current?.focus();
  }, [selected]);
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
              opener.current = event.currentTarget;
              setSelected(post);
            }}
          >
            <time dateTime={post.date}>{post.date}</time>
            <div>
              <span className="updates-meta">{post.status}</span>
              <h3>{post.title}</h3>
            </div>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
      <dialog
        ref={panel}
        className="updates-post-panel"
        aria-labelledby={titleId}
        onClose={() => {
          setSelected(null);
          opener.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) panel.current?.close();
        }}
      >
        {selected && (
          <div className="updates-post-panel-content">
            <div className="updates-post-panel-top">
              <p className="updates-meta">
                {selected.category === "website"
                  ? "Website journal"
                  : "Development update"}
              </p>
              <button
                ref={closeButton}
                type="button"
                onClick={() => panel.current?.close()}
                aria-label="Close update"
              >
                Close ×
              </button>
            </div>
            <p className="updates-meta">
              <time dateTime={selected.date}>{selected.date}</time> ·{" "}
              {selected.status}
            </p>
            <h2 id={titleId}>{selected.title}</h2>
            <p>{selected.detail}</p>
            <div className="updates-post-panel-links">
              {selected.source && (
                <a href={selected.source}>Inspect the source record ↗</a>
              )}
              <a href={`/updates/${selected.id}`}>Open the full page →</a>
            </div>
            <p className="updates-footnote">
              A dated record. Integration, public availability and Human
              acceptance are separate states.
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}
