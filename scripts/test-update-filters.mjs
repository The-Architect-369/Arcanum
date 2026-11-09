import { test } from "node:test";
import assert from "node:assert/strict";
import {
  filterUpdates,
  emptyUpdateFilters,
} from "../apps/web/src/lib/update-filters.ts";
const posts = [
  {
    id: "older",
    date: "2026-09-28",
    title: "A public home",
    summary: "A place to explore",
    detail: "Website origins",
    category: "website",
    topic: "website",
    updateType: "website",
    status: "Published",
  },
  {
    id: "newest",
    date: "2026-10-14",
    title: "Reflection collections",
    summary: "More dependable local work",
    detail: "A19 is integrated",
    category: "development",
    topic: "arcanum",
    updateType: "progress",
    status: "Integrated",
  },
  {
    id: "release",
    date: "2026-10-05",
    title: "A reviewed release",
    summary: "Choose what to keep",
    detail: "Android download",
    category: "development",
    topic: "arcanum",
    updateType: "release",
    status: "Available",
  },
];
test("newest first without mutating the source record", () => {
  assert.deepEqual(
    filterUpdates(posts, emptyUpdateFilters).map((p) => p.id),
    ["newest", "release", "older"],
  );
  assert.equal(posts[0].id, "older");
});
test("search and topic/type filters intersect", () => {
  assert.deepEqual(
    filterUpdates(posts, {
      ...emptyUpdateFilters,
      text: "  ANDROID ",
      topic: "arcanum",
      type: "release",
    }).map((p) => p.id),
    ["release"],
  );
  assert.equal(
    filterUpdates(posts, { ...emptyUpdateFilters, topic: "arcnet" }).length,
    0,
  );
  assert.equal(
    filterUpdates(posts, { ...emptyUpdateFilters, text: "missing words" })
      .length,
    0,
  );
});
test("date bounds are inclusive and invalid ranges are empty", () => {
  assert.deepEqual(
    filterUpdates(posts, {
      ...emptyUpdateFilters,
      from: "2026-10-05",
      to: "2026-10-05",
    }).map((p) => p.id),
    ["release"],
  );
  assert.equal(
    filterUpdates(posts, {
      ...emptyUpdateFilters,
      from: "2026-10-14",
      to: "2026-09-28",
    }).length,
    0,
  );
});
