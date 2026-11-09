"use client";
import { useEffect, useRef, useState } from "react";
import UpdateRows from "./UpdateRows";
import type { UpdatePost } from "@/lib/update-posts";
import {
  emptyUpdateFilters,
  filterUpdates,
  type UpdateFilters,
} from "@/lib/update-filters";
export default function UpdatesFeed({ posts }: { posts: UpdatePost[] }) {
  const [filters, setFilters] = useState<UpdateFilters>(emptyUpdateFilters);
  const [limit, setLimit] = useState(6);
  const sentinel = useRef<HTMLDivElement>(null);
  const result = filterUpdates(posts, filters);
  const active =
    filters.text.trim() !== "" ||
    filters.topic !== "all" ||
    filters.type !== "all" ||
    filters.from !== "" ||
    filters.to !== "";
  function change(key: keyof UpdateFilters, value: string) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setLimit(6);
  }
  useEffect(() => {
    const resetTop = () =>
      document.querySelector("#public-main")?.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    window.addEventListener("arcanum:updates-top", resetTop);
    return () => window.removeEventListener("arcanum:updates-top", resetTop);
  }, []);
  useEffect(() => {
    if (
      !sentinel.current ||
      !("IntersectionObserver" in window) ||
      limit >= result.length
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting))
          setLimit((previous) => previous + 6);
      },
      { root: document.querySelector("#public-main"), rootMargin: "160px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [limit, result.length]);
  return (
    <>
      <div className="updates-filters" aria-label="Search and filter updates">
        <label className="updates-search">
          Search updates
          <input
            type="search"
            value={filters.text}
            onChange={(event) => change("text", event.target.value)}
            placeholder="A topic, a word, a question…"
          />
        </label>
        <details className="updates-filter-options">
          <summary>Filters{active ? " · active" : ""}</summary>
          <div className="updates-filter-fields">
            <label>
              Topic
              <select
                value={filters.topic}
                onChange={(event) => change("topic", event.target.value)}
              >
                <option value="all">All topics</option>
                <option value="arcanum">Arcanum</option>
                <option value="arcnet">ARCnet</option>
                <option value="website">Website</option>
              </select>
            </label>
            <label>
              Update type
              <select
                value={filters.type}
                onChange={(event) => change("type", event.target.value)}
              >
                <option value="all">All updates</option>
                <option value="release">Releases</option>
                <option value="progress">Progress</option>
                <option value="website">Website notes</option>
              </select>
            </label>
            <label>
              From
              <input
                type="date"
                value={filters.from}
                onChange={(event) => change("from", event.target.value)}
              />
            </label>
            <label>
              Through
              <input
                type="date"
                value={filters.to}
                onChange={(event) => change("to", event.target.value)}
              />
            </label>
          </div>
        </details>
        <div className="updates-filter-result">
          <span role="status">
            {result.length} {result.length === 1 ? "update" : "updates"}
            {active ? " · filters active" : " · newest first"}
          </span>
          {active && (
            <button
              type="button"
              onClick={() => {
                setFilters(emptyUpdateFilters);
                setLimit(6);
              }}
            >
              Reset all
            </button>
          )}
        </div>
      </div>
      {result.length ? (
        <UpdateRows posts={result.slice(0, limit)} />
      ) : (
        <div className="updates-empty" role="status">
          <h3>No updates match yet.</h3>
          <p>
            {filters.from && filters.to && filters.from > filters.to
              ? "The start date is after the end date."
              : "Try a different word or broaden your filters."}
          </p>
          <button
            type="button"
            onClick={() => {
              setFilters(emptyUpdateFilters);
              setLimit(6);
            }}
          >
            Show all updates
          </button>
        </div>
      )}
      <div
        ref={sentinel}
        className="updates-load-sentinel"
        aria-hidden="true"
      />
      {limit < result.length && (
        <button
          className="updates-load-more"
          type="button"
          onClick={() => setLimit((previous) => previous + 6)}
        >
          Show older updates
        </button>
      )}
      <p className="updates-footnote">
        You’re reading a curated published record.{" "}
        <a href="/updates/archive">Browse the dated archive</a>.
      </p>
    </>
  );
}
